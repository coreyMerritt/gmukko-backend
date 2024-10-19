import fs from 'fs'
import path from 'path'
import express from 'express'
import AI from './ai.js'
import { Prompts } from './supporting-classes/prompts.js'

export class Files {
    private static directory = '/mnt/z/media/videos/movies'
    private static acceptableExtensions = ['.mp4', '.avi', '.mkv', '.mov']

    public static async placeholderName() {
        const filePaths = await Files.getMatchingFilesRecursively(Files.directory, Files.acceptableExtensions)
        const ai = new AI()
        for (const [i, filePath] of filePaths.entries()) {
            const aiResult = await ai.evaluate(Prompts.ReturnMediaAsJson, filePath)
            try {
                const fileObject = JSON.parse(aiResult)
                return fileObject
            } catch (error) {
                console.error(`\nUnable to parse: ${aiResult}\n\n${error}`)
            }
        }
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