import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import AI from './ai.js'
import MediaFile from './supporting_classes/media_file.js'
import { Prompts } from './supporting_classes/prompts.js' 


export default class MediaFiles {

    public static async getMediaFiles(directory: string, acceptableExtensions: string[]): Promise<MediaFile[]> {
        var filePaths = await this.getMediaFilePathsRecursively(directory, acceptableExtensions)
        filePaths = await this.removeMediaShorts(filePaths, ['featurette', 'deleted-scenes'], 600)
        const ai = new AI()
        const aiResult = await ai.evaluate(Prompts.ReturnMediaAsJson, filePaths)
        var mediaFiles: MediaFile[] = []

        try {
            mediaFiles = JSON.parse(aiResult)
            console.log(JSON.stringify(mediaFiles))
        } catch (error) {
            console.error(`\nUnable to parse: ${aiResult}\n\n${error}`)
        }

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

        return filesMatchingExtension
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
}