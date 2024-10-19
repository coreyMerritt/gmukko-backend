import fs from 'fs'
import path from 'path'
import express from 'express'

export class Files {
    private static directory = '/mnt/z/media'
    private static acceptableExtensions = ['.mp4', '.avi', '.mkv', '.mov']

    private static async placeholderName() {
        const filePaths = Files.getMatchingFilesRecursively(Files.directory, Files.acceptableExtensions)
        
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