import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import AI from './ai.js'
import MediaFile from './supporting_classes/media_file.js'
import { Prompts } from './supporting_classes/prompts.js' 
import Database from './db.js'
import { getEnvironmentData } from 'worker_threads'


export default class MediaFiles {

    public static async getMediaFilesToIndex(directory: string, acceptableExtensions: string[]): Promise<MediaFile[]> {
        var filePaths = await this.getMediaFilePathsRecursively(directory, acceptableExtensions)
        filePaths = await Database.removeIndexedFiles(filePaths)
        var mediaFiles: MediaFile[] = await this.generateMediaFiles(filePaths)
        return mediaFiles
    }


    private static async getMediaFilePathsRecursively(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        for (const filePath of files) {
            const fullPath = path.join(directoryToCheck, filePath)
            const fileExtension = path.extname(filePath)
            const stats = fs.statSync(fullPath)
            
            if (stats.isDirectory()) {
                const nestedFiles = await this.getMediaFilePathsRecursively(fullPath, extensionsToMatch)
                filesMatchingExtension = filesMatchingExtension.concat(nestedFiles)
            } else {
                const isProperFileExtension = extensionsToMatch.some(extensionToMatch => extensionToMatch === fileExtension);
                if (isProperFileExtension) {
                    filesMatchingExtension.push(fullPath);
                }
            }
        }
        const filesMatchingExtensionMinusShorts = await this.removeMediaShorts(filesMatchingExtension, ['featurette', 'deleted-scenes'], 600)
        return filesMatchingExtensionMinusShorts
    }


    private static async removeMediaShorts(filePaths: string[], unacceptableFilePaths: string[], acceptableLengthInSeconds: number) {
        const newFilePaths: string[] = []

        const promises = filePaths.map(filePath => {
            return new Promise<void>((resolve, reject) => {
                ffmpeg.ffprobe(filePath, (error, metadata) => {
                    if (error) {
                        console.error(`Error reading video file: ${filePath}`, error)
                        return resolve()
                    }

                    const lengthInSeconds = metadata.format.duration
                    if (lengthInSeconds && lengthInSeconds > acceptableLengthInSeconds) {
                        var returnFilePath = true
                        for (const [i, unacceptableFilePath] of unacceptableFilePaths.entries()) {
                            if (filePath.includes(unacceptableFilePath)) {
                                returnFilePath = false
                            }
                        }
                        returnFilePath ? newFilePaths.push(filePath) : undefined
                    }
                    resolve()
                })
            })
        })

        await Promise.all(promises)
        return newFilePaths
    }


    private static async parseFilesWithAi(filesToParse: string[]) {
        const ai = new AI()
        const aiResult = await ai.evaluate(Prompts.ReturnMediaAsJson, filesToParse)
        const filteredResult = this.stringToJsonArray(aiResult)
        const aiResultAsArrayOfObjects = await JSON.parse(filteredResult)

        return aiResultAsArrayOfObjects
    }


    private static stringToJsonArray(someString: string) {
        someString = someString.replace(/ /g, "")
        someString = someString.replace(/\s+/g, "")

        var posOpen = 0
        var locationOfOpenBracket = someString.indexOf('[', posOpen)
        var nextChar = ""
        while (nextChar != "{") {
            locationOfOpenBracket = someString.indexOf('[', posOpen)
            var nextChar = someString.charAt(locationOfOpenBracket + 1)
            posOpen = locationOfOpenBracket + 1
        }
        
        var posClose = 0
        var previousChar = ""
        var locationOfCloseBracket = someString.indexOf(']', posClose)
        while (previousChar != "}") {
            locationOfCloseBracket = someString.indexOf(']', posClose)
            var previousChar = someString.charAt(locationOfCloseBracket - 1)
            posClose = locationOfCloseBracket + 1
        }

        return someString.substring(locationOfOpenBracket, locationOfCloseBracket + 1)
    }


    private static async generateMediaFiles(filePaths: string[]) {
        var mediaFiles: MediaFile[] = [] 
        var workingArray: string[] = []
        for (const [i, filePath] of filePaths.entries()) {
            workingArray.push(filePath)
            if (i+1 % 10 === 0) {
                const tenMediaFiles = await this.parseFilesWithAi(workingArray)
                mediaFiles = mediaFiles.concat(tenMediaFiles)
                workingArray = []
            } else if (i+1 === filePaths.length) {
                const upToNineMediaFiles = await this.parseFilesWithAi(workingArray)
                mediaFiles = mediaFiles.concat(upToNineMediaFiles)
            }
        }
        return mediaFiles
    }
}