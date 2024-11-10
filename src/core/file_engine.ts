import { GmukkoLogger } from '../core/index.js'
import { Media } from '../media/media.js'
import { StagingDirectories } from '../configuration/directories/index.js'
import path from 'path'
import fs from 'fs'
import { Start } from '../startup/start.js'
import { Config } from '../configuration/config.js'


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
    Rejected = 'rejected'
}


export class FileEngine {

    private static stagingDirectory: string
    private static productionDirectory: string
    private static rejectionDirectory: string

    public static async initializeDirectories() {
        if (Start.test) {
            this.stagingDirectory = Config.stagingDirectory
        }
    }

    public static async fileExists(filePath: string): Promise<boolean> {
        try {
            fs.accessSync(filePath)
            return true
        } catch {
            return false
        }
    }

    public static async moveStagingFilesToProduction(validationResponse: ValidationResponse): Promise<void> {
        await this.moveStagingFilesToPath(validationResponse, LandingPoints.Production)
    }

    public static async moveStagingFilesToRejected(validationResponse: ValidationResponse): Promise<void> {
        await this.moveStagingFilesToPath(validationResponse, LandingPoints.Rejected)
    }

    public static async getFilePaths(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
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

    private static async moveStagingFilesToPath(validationResponse: ValidationResponse, landing: LandingPoints): Promise<void> {
        GmukkoLogger.info(`Attempting to move files from staging to ${landing}...`)

        var count = 0
        for (const [, tableName] of Object.keys(validationResponse.tables).entries()) {
            for (var [, media] of validationResponse.tables[tableName].entries()) {
                var newFilePath: string
                if (landing === LandingPoints.Production) {
                    newFilePath = media.getProductionFilePath()
                } else if (landing === LandingPoints.Rejected) {
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
    }

    private static async cleanStagingDirectory(): Promise<void> {
        for (const [, directory] of Object.values(StagingDirectories).entries()) {
            this.deleteEmptyDirectories(directory)
        }
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
}