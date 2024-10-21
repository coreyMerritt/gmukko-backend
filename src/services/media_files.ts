import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import AI from './ai.js'
import { Prompts } from '../interfaces_and_enums/prompts.js' 
import Database from './db.js'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import { MediaFileData } from '../interfaces_and_enums/video_file_data_types.js'


export default class MediaFiles {

    public static async getFileDataToIndex(directory: string, acceptableExtensions: string[], table: DatabaseTables): Promise<MediaFileData[]> {
        console.log (`Attempting to retrieve media file data to index...`)
        try {
            var filePaths = await this.getMediaFilePathsRecursively(directory, acceptableExtensions)
            const filePathsMinusAlreadyIndexed = await Database.removeIndexedFilesFromPaths(filePaths, table)
            const prompt = this.determinePromptByTable(table)
            var mediaFiles: MediaFileData[] = await this.generateMediaFileData(filePathsMinusAlreadyIndexed, prompt)
            console.log(`Successfully retrieved media file data to index.`)
            return mediaFiles
        } catch (error) {
            console.error(`Failed to retrieve media file data to index.\n`, error)
            return []
        }
    }


    private static async getMediaFilePathsRecursively(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        console.log(`Attempting to get media file paths from filesystem...`)
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        for (const [i, filePath] of files.entries()) {
            console.log(`\tChecking file #: ${i}`)
            console.log(`\tChecking file: ${filePath}`)
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
                    console.log(`\t\tAdded file: ${fullPath}.`)
                } else {
                    console.log(`\t\tIgnored file: ${fullPath}.`)
                }
            }
        }
        const filesMatchingExtensionMinusShorts = await this.removeMediaShorts(filesMatchingExtension, ['featurette', 'deleted-scenes'], 600)
        console.log(`Succesfully retrieved ${filesMatchingExtensionMinusShorts.length} file path from ${directoryToCheck}.`)
        return filesMatchingExtensionMinusShorts
    }


    private static async removeMediaShorts(filePaths: string[], unacceptableFilePaths: string[], acceptableLengthInSeconds: number) {
        // This callback structure is a mess. Plans to refactor this.
        console.log(`Attempting to removing any shorts from current filePaths...`)
        const newFilePaths: string[] = []

        const promises = filePaths.map(filePath => {
            return new Promise<void>((resolve, reject) => {
                ffmpeg.ffprobe(filePath, (error, metadata) => {
                    if (error) {
                        console.error(`\tError reading video file: ${filePath}\n`, error)
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
                                console.log(`\tKeeping file: ${filePath}`)
                                newFilePaths.push(filePath)
                            } else {
                                console.log(`\tRemoving file: ${filePath}`)
                            }
                        }
                    }
                    resolve()
                })
            })
        })

        await Promise.all(promises)
        console.log(`Successfully removed ${filePaths.length - newFilePaths.length} shorts from list of file paths.`)
        return newFilePaths
    }


    private static async parseFilesWithAi(filesToParse: string[], prompt: Prompts): Promise<MediaFileData[]> {
        console.log(`Attempting to parse ${filesToParse.length} files with AI...`)
        try {
            const ai = new AI()
            const aiResult = await ai.evaluate(prompt, filesToParse)
            if (aiResult) {
                const filteredResult = await this.stringToJsonArray(aiResult)
                if (filteredResult) {
                    const aiResultAsArrayOfObjects = await JSON.parse(filteredResult)
                    console.log(`Successfully parsed a batch of files with AI.`)
                    return aiResultAsArrayOfObjects
                } else {
                    console.error(`Unable to parse the JSON result.`)
                    return []
                }
            } else {
                console.error(`Failed. AI returned an empty result.\n`)
                return []
            }
        } catch (error) {
            console.error(`Failed to parse ${filesToParse.length} files with AI.\n`, error)
            return []
        }
    }


    private static stringToJsonArray(someString: string): Promise<string|undefined> {
        return new Promise((resolve) => {

            const timeout = setTimeout(() => {
                resolve(undefined)
            }, 3000)
    
            someString = someString.replace(/ /g, "")
            someString = someString.replace(/\s+/g, "")
    
            var posOpen = 0;
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
        });
    }


    public static async generateMediaFileData(filePaths: string[], prompt: Prompts) {
        // This structure is to optimize token usage on OpenAI API calls.
        console.log(`Attempting to generate data for ${filePaths.length} media files...`)
        var mediaFiles: MediaFileData[] = [] 
        var workingArray: string[] = []
        for (const [i, filePath] of filePaths.entries()) {
            workingArray.push(filePath)
            if (((i+1) % 10) === 0) {
                const tenMediaFiles = await this.parseFilesWithAi(workingArray, prompt)
                console.log(`\tPushing ${tenMediaFiles.length} pieces of media file data.`)
                mediaFiles = mediaFiles.concat(tenMediaFiles)
                workingArray = []
            } else if (i+1 === filePaths.length) {
                const upToNineMediaFiles = await this.parseFilesWithAi(workingArray, prompt)
                console.log(`\tPushing a final ${upToNineMediaFiles.length} peices of media file data.`)
                mediaFiles = mediaFiles.concat(upToNineMediaFiles)
            }
        }
        console.log(`Finished parsing ${filePaths.length} files with AI.`)
        return mediaFiles
    }


    private static determinePromptByTable(table: DatabaseTables): Prompts {
        switch (table) {
            case DatabaseTables.MovieFileData:
                return Prompts.ReturnMovieAsJson
                break
            case DatabaseTables.ShowFileData:
                return Prompts.ReturnShowAsJson
                break
            case DatabaseTables.StandupFileData:
                return Prompts.ReturnStandupAsJson
                break
            case DatabaseTables.AnimeFileData:
                return Prompts.ReturnAnimeAsJson
                break
            case DatabaseTables.AnimationFileData:
                return Prompts.ReturnAnimationAsJson
                break
            case DatabaseTables.InternetFileData:
                return Prompts.ReturnInternetAsJson
                break
        }
    }
}