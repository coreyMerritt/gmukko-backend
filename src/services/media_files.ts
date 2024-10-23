import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import AI from './ai.js'
import { Prompts } from '../interfaces_and_enums/prompts.js' 
import Database from './db.js'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import { MediaFileData } from '../interfaces_and_enums/video_file_data_types.js'
import { json, Sequelize } from 'sequelize'
import GmukkoLogger from './gmukko_logger.js'
import Validators from './validators.js'


export default class MediaFiles {

    public static async getFileDataToIndex(directory: string, acceptableExtensions: string[], db: Sequelize, table: DatabaseTables): Promise<MediaFileData[]> {
        GmukkoLogger.info(`Attempting to retrieve media file data to index.`)
        try {
            var filePaths = await this.getMediaFilePathsRecursively(directory, acceptableExtensions)
            const filePathsMinusAlreadyIndexed = await Database.removeIndexedFilesFromPaths(filePaths, db, table)
            const prompt = this.determinePromptByTable(table)
            var mediaFiles: MediaFileData[] = await this.generateMediaFileData(filePathsMinusAlreadyIndexed, prompt)
            GmukkoLogger.info(`Successfully retrieved media file data to index.`)
            return mediaFiles
        } catch (error) {
            GmukkoLogger.error(`Failed to retrieve media file data to index.`, error)
            return []
        }
    }


    private static async getMediaFilePathsRecursively(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        GmukkoLogger.info(`Attempting to get media file paths from filesystem.`)
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        for (const [i, filePath] of files.entries()) {
            GmukkoLogger.info(`Checking file #${i}: ${filePath}`)
            const fullPath = path.join(directoryToCheck, filePath)
            const fileExtension = path.extname(filePath)
            const stats = fs.statSync(fullPath)
            
            if (stats.isDirectory()) {
                const nestedFiles = await this.getMediaFilePathsRecursively(fullPath, extensionsToMatch)
                filesMatchingExtension = filesMatchingExtension.concat(nestedFiles)
            } else {
                const isProperFileExtension = extensionsToMatch.some(extensionToMatch => extensionToMatch === fileExtension);
                if (isProperFileExtension) {
                    filesMatchingExtension.push(fullPath)
                    GmukkoLogger.info(`Added file: ${fullPath} to initial indexing.`)
                } else {
                    GmukkoLogger.info(`Ignored file: ${fullPath} from initial indexing.`)
                }
            }
        }
        const filesMatchingExtensionMinusShorts = await this.removeMediaShorts(filesMatchingExtension, ['featurette', 'deleted-scenes'], 600)
        GmukkoLogger.info(`Succesfully retrieved ${filesMatchingExtensionMinusShorts.length} file paths from ${directoryToCheck}.`)
        return filesMatchingExtensionMinusShorts
    }


    private static async removeMediaShorts(filePaths: string[], unacceptableFilePaths: string[], acceptableLengthInSeconds: number) {
        // This callback structure is a mess. Plans to refactor this.
        GmukkoLogger.info(`Attempting to removing any shorts from current filePaths.`)
        const newFilePaths: string[] = []

        const promises = filePaths.map(filePath => {
            return new Promise<void>((resolve, reject) => {
                ffmpeg.ffprobe(filePath, (error, metadata) => {
                    if (error) {
                        GmukkoLogger.error(`Error reading video file: ${filePath}`, error)
                        return resolve()
                    } else {
                        const lengthInSeconds = metadata.format.duration
                        if (lengthInSeconds && lengthInSeconds > acceptableLengthInSeconds) {
                            var returnFilePath = true
                            for (const [i, unacceptableFilePath] of unacceptableFilePaths.entries()) {
                                if (filePath.includes(unacceptableFilePath)) {
                                    returnFilePath = false
                                }
                            }
                            if (returnFilePath) {
                                GmukkoLogger.info(`Keeping file: ${filePath}`)
                                newFilePaths.push(filePath)
                            } else {
                                GmukkoLogger.info(`Removing file: ${filePath}`)
                            }
                        }
                    }
                    resolve()
                })
            })
        })

        await Promise.all(promises)
        GmukkoLogger.info(`Successfully removed ${filePaths.length - newFilePaths.length} shorts from list of file paths.`)
        return newFilePaths
    }


    private static async parseFilePathsToMediaData(filesToParse: string[], prompt: Prompts): Promise<MediaFileData[]|undefined> {
        try {
            const ai = new AI()
            const aiResult = await ai.evaluate(prompt, filesToParse)
            if (aiResult) {
                const jsonArray = await this.stringToJsonArray(aiResult, prompt, filesToParse)
                if (jsonArray) {
                    if (Validators.isMediaDataArray(jsonArray)) {
                        return jsonArray
                    } else {
                        GmukkoLogger.invalidMediaData(jsonArray)
                        return undefined
                    }
                } else {
                    GmukkoLogger.error(`Unable to parse the result as a JSON array.`)
                    return []
                }
            } else {
                GmukkoLogger.error(`Failed to parse filePaths. AI returned an empty result.`)
                return []
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to parse ${filesToParse.length} files.`, error)
            return []
        }
    }


    private static async stringToJsonArray(someString: string, prompt: Prompts, data: string[]): Promise<object[]|undefined> {
        const jsonArrayAsString = await this.stringToJsonArrayString(someString)
        if (jsonArrayAsString) {
            return JSON.parse(jsonArrayAsString)
        } else {
            GmukkoLogger.invalidJsonArray(prompt, data, someString)
            return undefined
        }
    }


    private static async stringToJsonArrayString(someString: string): Promise<string|undefined> {
        return new Promise((resolve) => {

            const timeout = setTimeout(() => {
                resolve(undefined)
            }, 3000)
    
            someString = someString.replace(/ /g, "")
            someString = someString.replace(/\s+/g, "")
    
            var posOpen = 0
            var locationOfOpenBracket = someString.indexOf('[', posOpen)
            var nextChar = ""
            while (nextChar !== "{") {
                locationOfOpenBracket = someString.indexOf('[', posOpen)
                nextChar = someString.charAt(locationOfOpenBracket + 1)
                posOpen = locationOfOpenBracket + 1
            }
    
            var posClose = 0
            var previousChar = ""
            var locationOfCloseBracket = someString.indexOf(']', posClose)
            while (previousChar !== "}") {
                locationOfCloseBracket = someString.indexOf(']', posClose)
                previousChar = someString.charAt(locationOfCloseBracket - 1)
                posClose = locationOfCloseBracket + 1
            }
    
            const result = someString.substring(locationOfOpenBracket, locationOfCloseBracket + 1)
    
            clearTimeout(timeout)
            resolve(result)
        })
    }


    public static async generateMediaFileData(filePaths: string[], prompt: Prompts) {
        // This structure is to optimize token usage on OpenAI API calls.
        GmukkoLogger.info(`Attempting to parse ${filePaths.length} file paths.`)
        var mediaFiles: MediaFileData[] = [] 
        var workingArray: string[] = []
        for (const [i, filePath] of filePaths.entries()) {
            workingArray.push(filePath)
            if (((i+1) % 30) === 0) {
                GmukkoLogger.info(`Attempting to parse files ${i-28}-${i+1} of ${filePaths.length}.`)
                const tenMediaFiles = await this.parseFilePathsToMediaData(workingArray, prompt)
                if (tenMediaFiles) {
                    mediaFiles = mediaFiles.concat(tenMediaFiles)
                }
                workingArray = []
            } else if (i+1 === filePaths.length) {
                GmukkoLogger.info(`Attempting to parse files ${(Math.floor(i/30)*30)+1}-${i+1} of ${filePaths.length}.`)
                const upToNineMediaFiles = await this.parseFilePathsToMediaData(workingArray, prompt)
                if (upToNineMediaFiles) {
                    mediaFiles = mediaFiles.concat(upToNineMediaFiles)
                }
            }
        }
        GmukkoLogger.info(`Finished parsing ${filePaths.length} file paths.`)
        return mediaFiles
    }


    private static determinePromptByTable(table: DatabaseTables): Prompts {
        switch (table) {
            case DatabaseTables.Movies:
                return Prompts.ReturnMovieAsJson
                break
            case DatabaseTables.Shows:
                return Prompts.ReturnShowAsJson
                break
            case DatabaseTables.Standup:
                return Prompts.ReturnStandupAsJson
                break
            case DatabaseTables.Anime:
                return Prompts.ReturnAnimeAsJson
                break
            case DatabaseTables.Animation:
                return Prompts.ReturnAnimationAsJson
                break
            case DatabaseTables.Internet:
                return Prompts.ReturnInternetAsJson
                break
        }
    }
}