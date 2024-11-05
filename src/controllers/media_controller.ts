import { AI, Database, GmukkoLogger, Validators } from '../core/index.js'
import { VideoFactory, VideoTypes } from '../media/video/index.js'
import { DatabaseNames, DatabaseTableNames } from '../configuration/db/index.js'
import { Media } from '../media/media.js'
import { StagingDirectories } from '../configuration/directories/index.js'
import path from 'path'
import fs from 'fs'

interface TableRequest {
    [tableName: string]: Media[]
}

interface TableResponse {
    [tableName: string]: Media[]
}

export interface ValidationRequest {
    tables: TableRequest
}

export interface ValidationResponse {
    tables: TableResponse
}

enum LandingPoints {
    Staging = 'staging',
    Production = 'production',
    Reject = 'reject'
}

export class MediaController {

    public static async moveStagingFilesToProduction(validationResponse: ValidationResponse): Promise<ValidationResponse> {
        return await this.moveStagingFilesToPath(validationResponse, LandingPoints.Production)
    }

    public static async moveStagingFilesToRejects(validationResponse: ValidationResponse): Promise<ValidationResponse> {
        return await this.moveStagingFilesToPath(validationResponse, LandingPoints.Reject)
    }

    public static async indexFilesIntoStagingDatabase(videoType: string | undefined): Promise<void> {
        var count
        if (!videoType) {
            count = await this.indexAllStagingDirectories()
        } else if (Validators.isVideoType(videoType)) {
            const nullVideo = VideoFactory.createNullFromVideoType(videoType)
            count = await this.indexOneStagingDirectory(nullVideo)
        } else {
            throw new Error(`Passed an invalid video type.`)
        }
        GmukkoLogger.success(`${count} staging file${count > 1 ? 's' : ''} indexed.`)
    }


    public static async createValidationRequestFromStaging(): Promise<ValidationRequest> {
        var validationRequest: ValidationRequest = { tables: {} }
        
        try {
            for (const [, tableName] of Object.values(DatabaseTableNames).entries()) {
                validationRequest.tables[tableName] = []
                const results = await Database.getStagingDatabaseEntriesFromTable(tableName)
                for (const [, media] of results.entries()) {
                    if (Validators.isMedia(media)) {
                        validationRequest.tables[tableName].push(media)
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to get indexed staging media for a validation request.`, { cause: error })
        }

        GmukkoLogger.success(`Sent validation request.`)
        return validationRequest
    }


    private static async indexAllStagingDirectories(): Promise<number> {
        var count = 0

        const nullAnimation = VideoFactory.createNullFromVideoType(VideoTypes.Animation)
        count += await this.indexOneStagingDirectory(nullAnimation)

        const nullAnime = VideoFactory.createNullFromVideoType(VideoTypes.Anime)
        count += await this.indexOneStagingDirectory(nullAnime)

        const nullMovie = VideoFactory.createNullFromVideoType(VideoTypes.Movie)
        count += await this.indexOneStagingDirectory(nullMovie)

        const nullShow = VideoFactory.createNullFromVideoType(VideoTypes.Show)
        count += await this.indexOneStagingDirectory(nullShow)

        const nullStandup = VideoFactory.createNullFromVideoType(VideoTypes.Standup)
        count += await this.indexOneStagingDirectory(nullStandup)

        const nullMiscVideo = VideoFactory.createNullFromVideoType(VideoTypes.Misc)
        count += await this.indexOneStagingDirectory(nullMiscVideo)
        
        return count
    }


    private static async indexOneStagingDirectory(nullMedia: Media): Promise<number> {
        var count = 0

        try {
            const filePaths = await this.getFilePaths(nullMedia.getStagingDirectory(), nullMedia.getFileExtensions())
            const filteredFilePaths = await Database.removeAlreadyIndexedFilePaths(DatabaseNames.Staging, filePaths)
            if (filePaths.length > 0) {
                const media = await AI.parseAllMediaData(filteredFilePaths, nullMedia.getPrompt())
                if (media.length > 0) {
                    const indexCount = await Database.indexFilesIntoStagingDatabase(media)
                    indexCount ? count = indexCount : undefined
                }
            }
        } catch (error) {{
            throw new Error(`Unable to index staging directory: ${nullMedia.getStagingDirectory()}`, { cause: error })
        }}

        return count
    }

    private static async getFilePaths(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        try {
            const files = fs.readdirSync(directoryToCheck)
            var filesMatchingExtension: string[] = []

            for (const [, filePath] of files.entries()) {
                const fullPath = path.join(directoryToCheck, filePath)
                const fileExtension = path.extname(filePath)
                const stats = fs.statSync(fullPath)
            
                if (stats.isDirectory()) {
                    const nestedFiles = await this.getFilePaths(fullPath, extensionsToMatch)
                    filesMatchingExtension = filesMatchingExtension.concat(nestedFiles)
                } else {
                    const isProperFileExtension = extensionsToMatch.some(extensionToMatch => extensionToMatch === fileExtension);
                    if (isProperFileExtension) {
                        filesMatchingExtension.push(fullPath)
                        GmukkoLogger.data(`Added file to be indexed`, fullPath)
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to get file paths for: ${directoryToCheck}`, { cause: error })
        }

        return filesMatchingExtension
    }


    private static async deleteEmptyDirectories(directory: string): Promise<boolean> {
        var files

        try {
            files = fs.readdirSync(directory)
        } catch (error) {
            return true
        }
    
        for (const file of files) {
            const fullPath = path.join(directory, file)
            var stats

            try {
                stats = fs.statSync(fullPath)
            } catch (error) {
                continue
            }
    
            if (stats.isDirectory()) {
                const isDirectoryEmpty = await this.deleteEmptyDirectories(fullPath)
                if (isDirectoryEmpty) {
                    try {
                        fs.rmdirSync(fullPath)
                    } catch {
                        // Not a genuine error
                    }
                }
            }
        }
    
        const remainingFiles = fs.readdirSync(directory)
        const isCurrentDirectoryEmpty = remainingFiles.length === 0
    
        return isCurrentDirectoryEmpty
    }


    private static async cleanStagingDirectory(): Promise<void> {
        for (const [, directory] of Object.values(StagingDirectories).entries()) {
            this.deleteEmptyDirectories(directory)
        }
    }

    private static async moveStagingFilesToPath(validationResponse: ValidationResponse, landing: LandingPoints): Promise<ValidationResponse> {
        GmukkoLogger.info(`Attempting to move files from staging to ${landing}...`)
        var count = 0
        for (const [, tableName] of Object.keys(validationResponse.tables).entries()) {
            for (var [, media] of validationResponse.tables[tableName].entries()) {
                var newFilePath: string
                // validationResponse.tables[tableName][i] = VideoFactory.createVideoFromTableName(media, tableName as DatabaseTableNames)
                if (landing === LandingPoints.Production) {
                    newFilePath = media.getProductionFilePath()
                } else if (landing === LandingPoints.Reject) {
                    newFilePath = media.getRejectFilePath()
                } else {
                    throw new Error (`Landing point for staging files is not yet configured.`)
                }

                try {
                    fs.mkdirSync(path.dirname(newFilePath), { recursive: true })
                    fs.accessSync(media.filePath)
                    fs.renameSync(media.filePath, newFilePath)
                    media.filePath = newFilePath
                    await this.cleanStagingDirectory()
                    count++
                } catch (error) {
                    throw new Error(`Something went wrong while trying to move staging file to ${landing}: ${media.filePath}.`, { cause: error })
                }
            }
        }
        GmukkoLogger.success(`${count} staging file${count > 1 ? 's' : ''} moved to production.`)
        return validationResponse
    }
}