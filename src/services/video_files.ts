import { Database, GmukkoLogger, Validators } from './index.js'
import { DatabaseTables, VideoData, Prompts } from '../interfaces_and_enums/index.js'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import AI from './ai.js'
import { Sequelize } from 'sequelize'



export class VideoFiles {

    public static async getFileDataToIndex(directory: string, acceptableExtensions: string[], db: Sequelize, table: DatabaseTables): Promise<VideoData[]|undefined> {
        GmukkoLogger.info(`Attempting to retrieve video file data to index.`)
        
        const prompt = this.determinePromptByTable(table)

        try {
            var filePaths = await this.getVideoFilePathsRecursively(directory, acceptableExtensions)
            const filePathsMinusIndexed = await this.removeIndexedFilesFromPaths(filePaths, db, table)
            if (filePathsMinusIndexed) {
                const filesPathsMinusIndexedAndShorts = await this.removeVideoShorts(filePathsMinusIndexed, ['featurette', 'deleted-scenes'], 600)
                var videoFiles: VideoData[] = await this.generateVideoData(filesPathsMinusIndexedAndShorts, prompt)
                GmukkoLogger.info(`Successfully retrieved video file data to index.`)
                return videoFiles
            } else {
                return undefined
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to retrieve video file data to index.`, error)
            return undefined
        }
    }


    private static async getVideoFilePathsRecursively(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        GmukkoLogger.info(`Attempting to get video file paths from filesystem.`)
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        for (const [i, filePath] of files.entries()) {
            GmukkoLogger.info(`Checking file #${i}: ${filePath}`)
            const fullPath = path.join(directoryToCheck, filePath)
            const fileExtension = path.extname(filePath)
            const stats = fs.statSync(fullPath)
            
            if (stats.isDirectory()) {
                const nestedFiles = await this.getVideoFilePathsRecursively(fullPath, extensionsToMatch)
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

        GmukkoLogger.info(`Succesfully retrieved ${filesMatchingExtension.length} file paths from ${directoryToCheck}.`)
        return filesMatchingExtension
    }


    public static async removeIndexedFilesFromPaths(filePaths: string[], db: Sequelize, table: DatabaseTables) {
        GmukkoLogger.info("Attempting to remove already indexed files from list of files to index.")
        var filePathsToToss: string[] = []
        try {
            for (const [i, filePath] of filePaths.entries()) {
                if (!await Database.filePathInTable(filePath, db, table)) {
                    GmukkoLogger.info(`Keeping file ${filePath} to index.`)
                }  else {
                    GmukkoLogger.info(`Tossing ${filePath} from list of files that need to be indexed.`)
                    filePathsToToss.push(filePath)
                }
            }
            GmukkoLogger.info(`Succesfully removed files already indexed in ${table}.`)
            const filteredFilePaths = filePaths.filter(filePath => !filePathsToToss.includes(filePath))
            return filteredFilePaths
        } catch (error) {
            GmukkoLogger.error(`Failed to remove files already indexed in ${table}.`, error)
            return undefined
        }
    }


    private static async removeVideoShorts(filePaths: string[], unacceptableFilePaths: string[], minimumLengthInSeconds: number) {
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
                        if (lengthInSeconds && lengthInSeconds > minimumLengthInSeconds) {
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
                                GmukkoLogger.info(`Tossing file: ${filePath}`)
                            }
                        }
                    }
                    resolve()
                })
            })
        })

        await Promise.all(promises)
        GmukkoLogger.debug(`filePaths.length = ${filePaths.length}, newFilePaths.length = ${newFilePaths.length}`)
        GmukkoLogger.info(`Successfully removed ${filePaths.length - newFilePaths.length} shorts from list of file paths.`)
        return newFilePaths
    }


    private static async parseFilePathsToVideoData(filesToParse: string[], prompt: Prompts): Promise<VideoData[]|undefined> {
        try {
            const ai = new AI()
            const aiResult = await ai.evaluate(prompt, filesToParse)
            if (aiResult) {
                const jsonArray = await this.stringToJsonArray(aiResult, prompt, filesToParse)
                if (jsonArray) {
                    if (Validators.isVideoDataArray(jsonArray)) {
                        return jsonArray
                    } else {
                        GmukkoLogger.invalidVideoData(jsonArray)
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


    public static async stringToJsonArrayString(someString: string): Promise<string|undefined> {
        const jsonArrayRegex = /\[(\s*{[\s\S]*?}\s*,?\s*)+\]/g
        var match

        while ((match = jsonArrayRegex.exec(someString)) !== null) {
            const potentialArray = match[0]

            try {
                const parsedArray = JSON.parse(potentialArray)

                if (Array.isArray(parsedArray) && parsedArray.some(item => typeof item === 'object')) {
                    return potentialArray
                }
            } catch (error) {
                continue
            }
        }

        return undefined
    }


    public static async generateVideoData(filePaths: string[], prompt: Prompts) {
        // This structure is to optimize token usage on OpenAI API calls.
        GmukkoLogger.info(`Attempting to parse ${filePaths.length} file paths.`)
        var videoFiles: VideoData[] = [] 
        var workingArray: string[] = []
        for (const [i, filePath] of filePaths.entries()) {
            workingArray.push(filePath)
            if (((i+1) % 30) === 0) {
                GmukkoLogger.info(`Attempting to parse files ${i-28}-${i+1} of ${filePaths.length}.`)
                const tenVideoFiles = await this.parseFilePathsToVideoData(workingArray, prompt)
                if (tenVideoFiles) {
                    videoFiles = videoFiles.concat(tenVideoFiles)
                }
                workingArray = []
            } else if (i+1 === filePaths.length) {
                GmukkoLogger.info(`Attempting to parse files ${(Math.floor(i/30)*30)+1}-${i+1} of ${filePaths.length}.`)
                const upToNineVideoFiles = await this.parseFilePathsToVideoData(workingArray, prompt)
                if (upToNineVideoFiles) {
                    videoFiles = videoFiles.concat(upToNineVideoFiles)
                }
            }
        }
        GmukkoLogger.info(`Finished parsing ${filePaths.length} file paths.`)
        return videoFiles
    }


    private static determinePromptByTable(table: DatabaseTables): Prompts {
        switch (table) {
            case DatabaseTables.Movies:
                return Prompts.ReturnMovieAsJson
            case DatabaseTables.Shows:
                return Prompts.ReturnShowAsJson
            case DatabaseTables.Standup:
                return Prompts.ReturnStandupAsJson
            case DatabaseTables.Anime:
                return Prompts.ReturnAnimeAsJson
            case DatabaseTables.Animation:
                return Prompts.ReturnAnimationAsJson
            case DatabaseTables.Internet:
                return Prompts.ReturnInternetAsJson
            default:
                return Prompts.ReturnInternetAsJson
        }
    }
}