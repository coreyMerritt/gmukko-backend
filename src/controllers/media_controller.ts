import { AI, Database, GmukkoLogger, Validators } from '../core/index.js'
import { Animation, Anime, MiscVideo, Movie, Show, Standup, VideoFactory, VideoTypes } from '../media/video/index.js'
import { DatabaseNames, DatabaseTableNames, StagingDirectories } from '../configuration/index.js'
import { Media } from '../media/media.js'
import { CoreDirectories } from '../configuration/index.js'
import path from 'path'
import fs from 'fs'

interface TableRequest {
    [tableName: string]: Media[]
}

export interface ValidationRequest {
    tables: TableRequest
}


export class MediaController {

    public static async moveStagingFilesToProduction(validationRequest: ValidationRequest) {
        GmukkoLogger.info(`Attempting to move files from staging to production...`)
        var count = 0
        for (const [, tableName] of Object.keys(validationRequest.tables).entries()) {
            for (const [, media] of validationRequest.tables[tableName].entries()) {
                const newFilePath = await this.getNewFilePathFromMedia(media, tableName as DatabaseTableNames)
                if (newFilePath) {
                    try {
                        fs.mkdirSync(path.dirname(newFilePath), { recursive: true })
                    } catch (error) {
                        throw new Error(`Unable to make directories for new file.\nStaging: ${media.filePath}\nProduction: ${newFilePath}`, { cause: error })
                    }
                    
                    try {
                        fs.accessSync(media.filePath)
                    } catch (error) {
                        throw new Error(`Unable to access staging file.`, { cause: error })
                    }

                    try {
                        fs.renameSync(media.filePath, newFilePath)
                        media.filePath = newFilePath
                    } catch (error) {
                        throw new Error(`Unable to move file from staging to production.`, { cause: error })
                    }

                    try {
                        this.cleanStagingDirectory()
                    } catch (error) {
                        GmukkoLogger.error(`Unable to clean up empty directories in staging.`, error)
                    }

                    count++
                } else {
                    throw new Error(`Unable to determine new file path for staging media: ${media.filePath}.`)
                }
            }
        }
        GmukkoLogger.success(`${count} staging file${count > 1 ? 's' : ''} moved to production.`)
        return validationRequest
    }

    public static async indexStaging(videoType: string | undefined) {
        var count
        if (videoType === undefined) {
            count = await this.indexAllStagingDirectories()
        } else if (Validators.isVideoType(videoType)) {
            const nullVideo = VideoFactory.createNullFromVideoType(videoType)
            count = await this.indexOneStagingDirectory(nullVideo)
        } else {
            throw new Error(`Passed an invalid video type.`)
        }
        GmukkoLogger.success(`${count} staging file${count > 1 ? 's' : ''} indexed.`)
    }


    public static async getStagingMedia(): Promise<ValidationRequest> {
        var validationRequest: ValidationRequest = { tables: {} }
        
        try {
            for (const [, tableName] of Object.values(DatabaseTableNames).entries()) {
                validationRequest.tables[tableName] = []
                const results = await Database.selectAllFromTable(DatabaseNames.Staging, tableName)
                if (results) {
                    for (const [, media] of results.entries()) {
                        if (Validators.isMedia(media)) {
                            validationRequest.tables[tableName].push(media)
                        }
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to get indexed staging media for a validation request.`, { cause: error })
        }

        GmukkoLogger.success(`Sent validation request.`)
        return validationRequest
    }

    private static async getNewFilePathFromMedia(media: Media, tableName: DatabaseTableNames) {
        var newBasePath = `${CoreDirectories.ProductionVideos}/${tableName}`
        var currentFileExtension = path.extname(media.filePath)
        var title = await this.prepStringForFilename(media.title)
        var artist = 'artist' in media ? await this.prepStringForFilename(String(media.artist)) : undefined
        var seasonNumber = 'seasonNumber' in media ? String(media.seasonNumber).padStart(2, '0') : undefined
        var episodeNumber = 'episodeNumber' in media ? String(media.episodeNumber).padStart(2, '0') : undefined

        switch (tableName) {
            case DatabaseTableNames.Animation:
                if (Validators.isAnimation(media)) {
                    return `${newBasePath}/${(title)}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
                } else {
                    throw new Error(`Media attempting to be sent to production under table ${tableName} is not actually an animation.`)
                }
            case DatabaseTableNames.Anime:
                if (Validators.isAnime(media)) {
                    return `${newBasePath}/${(title)}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
                } else {
                    throw new Error(`Media attempting to be sent to production under table ${tableName} is not actually an anime.`)
                }
            case DatabaseTableNames.Movies:
                if (Validators.isMovie(media)) {
                    return `${newBasePath}/(${media.releaseYear})-${title}${currentFileExtension}`
                } else {
                    throw new Error(`Media attempting to be sent to production under table ${tableName} is not actually a movie.`)
                }
            case DatabaseTableNames.Shows:
                if (Validators.isShow(media)) {
                    return `${newBasePath}/${(title)}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
                } else {
                    throw new Error(`Media attempting to be sent to production under table ${tableName} is not actually a show.`)
                }
            case DatabaseTableNames.Standup:
                if (Validators.isStandup(media)) {
                    return `${newBasePath}/${artist}/(${media.releaseYear})-${title}${currentFileExtension}`
                } else {
                    throw new Error(`Media attempting to be sent to production under table ${tableName} is not actually standup.`)
                }
            default:
                if (Validators.isMiscVideo(media)) {
                    return `${newBasePath}/${title}${currentFileExtension}`
                } else {
                    throw new Error(`Media sent to production under table ${tableName} is not actually a misc video.`)
                }
        }
    }

    private static async indexAllStagingDirectories() {
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


    private static async indexOneStagingDirectory(nullMedia: Media) {
        var count = 0

        try {
            const filePaths = await this.getFilePaths(nullMedia.getStagingDirectory(), nullMedia.getFileExtensions())
            const filteredFilePaths = await Database.removeAlreadyIndexedFilePaths(DatabaseNames.Staging, filePaths)
            if (filePaths.length > 0) {
                const media = await AI.parseAllMediaData(filteredFilePaths, nullMedia.getPrompt())
                if (media.length > 0) {
                    const indexCount = await Database.indexMedia(media)
                    indexCount ? count = indexCount : undefined
                }
            }
        } catch (error) {{
            throw new Error(`Unable to index staging directory: ${nullMedia.getStagingDirectory()}`, { cause: error })
        }}

        return count
    }

    public static async getFilePaths(directoryToCheck: string, extensionsToMatch: string[]) {
        try {
            const files = fs.readdirSync(directoryToCheck)
            var filesMatchingExtension: string[] = []

            for (const [i, filePath] of files.entries()) {
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


    public static async deleteEmptyDirectories(directory: string): Promise<boolean> {
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


    private static async cleanStagingDirectory() {
        for (const [, directory] of Object.values(StagingDirectories).entries()) {
            this.deleteEmptyDirectories(directory)
        }
    }

    private static async prepStringForFilename(someString: string): Promise<string> {
        var newString = someString.toLowerCase().replace(/ /g, '-').replace(`:`, ``).replace(`'`, ``).replace(`;`, "").replace(`"`, ``)
        newString = newString.replace(`?`, ``).replace(`>`, ``).replace(`<`, ``).replace(`\\`, `/`).replace(`|`, ``).replace(`*`, ``)
        return newString
    }
}