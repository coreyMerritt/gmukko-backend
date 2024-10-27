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
            console.error(`Unable to write pending staging media to: ${Paths.PendingStagingMedia}`)
        }
    }

    public async readAcceptedMedia() {
        const isPopulatedYaml = await this.isPopulatedYaml(Paths.AcceptedStagingMedia)
        if (isPopulatedYaml) {
            try {
                const acceptedFile = (await fs.readFile(Paths.AcceptedStagingMedia)).toString()
                const acceptedMedia = await yaml.parse(acceptedFile)
                console.log(`Successfully read accepted media.`)
                return acceptedMedia
            } catch (error) {
                console.error(`Failed to read accepted media.`)
            }
        }
    }

    public async readRejectedMedia(): Promise<Media[]|undefined> {
        const isPopulatedYaml = await this.isPopulatedYaml(Paths.RejectedStagingMedia)
        if (isPopulatedYaml) {
            try {
                const rejectedFile = (await fs.readFile(Paths.RejectedStagingMedia)).toString()
                const rejectedMedia = JSON.parse(rejectedFile)
                console.log(`Successfully read rejected media.`)
                return rejectedMedia
            } catch (error) {
                console.error(`Failed to read rejected media.`)
            }
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