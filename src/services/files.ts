import fs from 'fs'
import path from 'path'
import express from 'express'
import AI from './ai.js'
import { Prompts } from './supporting-classes/prompts.js'

export class Files {
    private static directory = '/mnt/z/media/videos/tv-shows/black-mirror'
    private static acceptableExtensions = ['.mp4', '.avi', '.mkv', '.mov']

    public static async placeholderName() {
        const filePaths = await Files.getMatchingFilesRecursively(Files.directory, Files.acceptableExtensions)
        for (const [i, filePath] of filePaths.entries()) {
            const ai = new AI()
            const fileObject = JSON.parse(await ai.evaluate(Prompts.ReturnMediaAsJson, filePath))
            console.log(JSON.stringify(fileObject))
        }
    }

    private static async getMatchingFilesRecursively(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        files.forEach(filePath => {
            const fullPath = path.join(directoryToCheck, filePath)
            const fileExtension = path.extname(filePath)
            const stats = fs.statSync(fullPath)
            
            if (stats.isDirectory()) {
                this.getMatchingFilesRecursively(directoryToCheck, extensionsToMatch)
            } else {
                const isProperFileExtension = extensionsToMatch.some((extensionToMatch) => {
                    extensionToMatch === fileExtension
                })
                if (isProperFileExtension) {
                    filesMatchingExtension.push(fullPath)
                }
            }
        })
        return filesMatchingExtension
    }
}