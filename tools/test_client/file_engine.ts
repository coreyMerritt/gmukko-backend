import yaml from 'yaml'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { Paths } from './configuration.js'
import { GmukkoTime } from '../../src/core/gmukko_time.js'


export class FileEngine {

    public async writeObjectAsYaml(object: object): Promise<void> {
        try {
            const pendingStagingMediaAsYamlString = yaml.stringify(object)
            await fs.writeFile(Paths.PendingValidation, pendingStagingMediaAsYamlString)
            console.log(`Wrote pending staging media to: ${Paths.PendingValidation}`)
        } catch (error) {
            throw new Error(`Unable to write pending staging media to: ${Paths.PendingValidation}`, { cause: error })
        }
    }

    public async readYamlFileToObject(path: Paths): Promise<object> {
        try {
            const fileContents = (await fs.readFile(path)).toString()
            const fileContentsObject = await yaml.parse(fileContents)
            return fileContentsObject
        } catch (error) {
            throw new Error(`Failed to read accepted media. Likely bad path or path is not yaml.`, { cause: error })
        }
    }

    public async isPopulatedYaml(filePath: string): Promise<boolean> {
        if (this.isYaml(filePath)) {
            try {
                const fileInfo = await fs.stat(filePath)
                if (fileInfo.size > 0) {
                    return true
                } else {
                    return false
                }
            } catch (error) {
                throw new Error(`Unable to check info on file: ${filePath}`, { cause: error })
            }
        } else {
            return false
        }
    }


    public async backupValidationFiles() {
        try {
            this.backupFile(Paths.PendingValidation, Paths.PendingValidationBackup)
            this.backupFile(Paths.AcceptedValidation, Paths.AcceptedValidationBackup)
            this.backupFile(Paths.RejectedValidation, Paths.RejectedValidationBackup)
        } catch {
            // File does not exist, no need to back up.
        }
    }

    public async truncateValidationFiles() {
        fsSync.truncateSync(Paths.PendingValidation)
        fsSync.truncateSync(Paths.AcceptedValidation)
        fsSync.truncateSync(Paths.RejectedValidation)
    }

    private backupFile(originalPath: Paths, backupPath: Paths) {
        try {
            const originalFileContent = this.readFileAsString(originalPath)
            const newFileDirectory = path.dirname(backupPath)
            const newFileName = path.basename(backupPath)
            const newFilePath = `${newFileDirectory}/${GmukkoTime.getCurrentDateTime(true)}---${newFileName}`
            fsSync.writeFileSync(newFilePath, originalFileContent)
        } catch (error) {
            throw new Error(`Failed to back up file: ${originalPath} to ${backupPath}`, { cause: error })
        }
    }

    private readFileAsString(path: Paths): string {
        try {
            const fileBuffer = fsSync.readFileSync(path)
            const fileString = String(fileBuffer)
            return fileString
        } catch (error) {
            throw new Error(`Unable to read as string: ${path}`, { cause: error })
        }
    }

    private fileExists(filePath: string): boolean {
        try {
            fsSync.accessSync(filePath)
            return true
        } catch {
            return false
        }
    }

    private isYaml(filePath: string): boolean {
        if (this.fileExists(filePath)) {
            try {
                yaml.parse(filePath)
                return true
            } catch {
                return false
            }
        } else {
            return false
        }
    }
}