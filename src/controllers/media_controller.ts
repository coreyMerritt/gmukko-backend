import { AI, Database, GmukkoLogger, MediaHandler, Validators } from '../core/index.js'
import { Animation, Anime, MiscVideo, Movie, Show, Standup, VideoFactory } from '../media/video/index.js'
import { DatabaseNames, DatabaseTableNames } from '../configuration/index.js'
import { Media } from '../media/media.js'

interface TableRequest {
    [key: string]: object[]
}

interface ValidationRequest {
    tables: TableRequest
}


export class MediaController {

    public static async indexStaging(videoType: string | undefined) {
        if (videoType === undefined) {
            this.indexAllStagingDirectories()
        } else if (Validators.isVideoType(videoType)) {
            const nullVideo = VideoFactory.createNullFromVideoType(videoType)
            this.indexOneStagingDirectory(nullVideo)
        } else {
            throw new Error(`Parameter passed was invalid.`)
        }
    }


    public static async getStagingMedia(): Promise<ValidationRequest> {
        var validationRequest: ValidationRequest = { tables: {} }
        
        for (const [, tableName] of Object.values(DatabaseTableNames).entries()) {
            validationRequest.tables[tableName] = []
            const results = await Database.selectAllFromTable(DatabaseNames.Staging, tableName)
            if (results) {
                for (const [, object] of results.entries()) {
                    validationRequest.tables[tableName].push(object)
                }
            }
        }

        return validationRequest
    }


    private static async indexAllStagingDirectories() {  
            const nullAnimation = new Animation("")
            this.indexOneStagingDirectory(nullAnimation)

            const nullAnime = new Anime("")
            this.indexOneStagingDirectory(nullAnime)

            const nullMovie = new Movie("")
            this.indexOneStagingDirectory(nullMovie)

            const nullShow = new Show("")
            this.indexOneStagingDirectory(nullShow)

            const nullStandup = new Standup("")
            this.indexOneStagingDirectory(nullStandup)

            const nullMiscVideo = new MiscVideo("")
            this.indexOneStagingDirectory(nullMiscVideo)
    }


    private static async indexOneStagingDirectory(nullMedia: Media) {
        const filePaths = await MediaHandler.getFilePaths(nullMedia.getStagingDirectory(), nullMedia.getFileExtensions())
        if (filePaths.length > 0) {
            const media = await AI.parseAllMediaData(filePaths, nullMedia.getPrompt())
            if (media.length > 0) {
                await Database.indexMedia(media)
            } else {
                GmukkoLogger.info(`No files to index.`)
            }
        } else {
            GmukkoLogger.info(`No files to index.`)
        }
    }
}