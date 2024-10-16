import fs from 'fs'
import path from 'path'
import express from 'express'

export class Files {
    public static async getAllFilesRecursively(directoryToCheck: string, extensionsToMatch: string[]) {
        const files = fs.readdirSync(directoryToCheck)
        
        files.forEach(file => {
            const filePath = path.join(directoryToCheck, file)
            const fileExtension = path.extname(file)
            const stats = fs.statSync(filePath)
            
            if (stats.isDirectory()) {
                this.getAllFilesRecursively(directoryToCheck, extensionsToMatch)
            } else {
                // if (extensionsToMatch.some())
            }
        })
    }
}