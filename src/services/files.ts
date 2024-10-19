import fs from 'fs'
import path from 'path'
import AI from './ai.js'
import MediaFile from './supporting_classes/media_file.js'
import { Prompts } from './supporting_classes/prompts.js' 


export class Files {

    public static async getMediaFiles(directory: string, acceptableExtensions: string[]): Promise<MediaFile[] | undefined> {
        var mediaFiles: MediaFile[] = []
        const filePaths = await this.getMatchingFilesRecursively(directory, acceptableExtensions)
        const ai = new AI()
        for (const [i, filePath] of filePaths.entries()) {
            const aiResult = await ai.evaluate(Prompts.ReturnMediaAsJson, filePath)
            try {
                const fileObject = JSON.parse(aiResult)
                mediaFiles.push(fileObject)
                console.debug(`${fileObject.title} processed.`)
            } catch (error) {
                console.error(`\nUnable to parse: ${aiResult}\n\n${error}`)
            }
        }
        return mediaFiles
    }

    private static async getMatchingFilesRecursively(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        for (const filePath of files) {
            const fullPath = path.join(directoryToCheck, filePath)
            const fileExtension = path.extname(filePath)
            const stats = fs.statSync(fullPath)
            
            if (stats.isDirectory()) {
                const nestedFiles = await this.getMatchingFilesRecursively(fullPath, extensionsToMatch)
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
}