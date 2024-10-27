import yaml from 'yaml'
import fs from 'fs/promises'
import { Paths } from './configuration.js'
import { Media } from '../../src/media/media.js'


export class FileEngine {

    public async writePendingStagingMedia(object: object): Promise<void> {
        try {
            const pendingStagingMediaAsYamlString = yaml.stringify(object)
            await fs.writeFile(Paths.PendingStagingMedia, pendingStagingMediaAsYamlString)
            console.log(`Wrote pending staging media to: ${Paths.PendingStagingMedia}`)
        } catch (error) {
            throw new Error(`Unable to write pending staging media to: ${Paths.PendingStagingMedia}`)
        }
    }

    public async readYamlFileToObject(path: Paths): Promise<object> {
        try {
            const fileContents = (await fs.readFile(path)).toString()
            const fileContentsObject = await yaml.parse(fileContents)
            return fileContentsObject
        } catch (error) {
            throw new Error(`Failed to read accepted media. Likely bad path or path is not yaml:\n${error}`)
        }
    }

    public async isPopulatedYaml(filePath: string): Promise<boolean> {
        if (this.isYaml(filePath)) {
            try {
                const fileInfo = await fs.stat(filePath)
                if (fileInfo.size > 0) {
                    return true
                } else {
                    console.log(`filePath is not populated yaml: ${filePath}`)
                    return false
                }
            } catch {
                return false
            }
        } else {
            return false
        }
    }

    public async backupPendingStagingMedia() {
        
    }

    private fileExists(filePath: string): boolean {
        try {
            fs.readFile(filePath)
            return true
        } catch {
            console.log(`filePath does not exist: ${filePath}`)
            return false
        }
    }

    private isYaml(filePath: string): boolean {
        if (this.fileExists(filePath)) {
            try {
                yaml.parse(filePath)
                return true
            } catch {
                console.log(`filePath is not valid yaml: ${filePath}`)
                return false
            }
        } else {
            console.log(`filePath is not valid yaml: ${filePath}`)
            return false
        }
    }
}