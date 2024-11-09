import { NextFunction, Request, Response } from 'express'
import { AI, Database, FileEngine, GmukkoLogger, ValidationRequest, Validators } from '../../core/index.js'
import { DatabaseNames, DatabaseTableNames } from '../../configuration/db/index.js'
import { VideoFactory, VideoTypes } from '../../media/video/index.js'
import { Media } from '../../media/media.js'


export class ValidationController {

    public static async indexStaging(req: Request, res: Response, next: NextFunction) {
        try {
            const videoType = req.params.videoType
            var count: number

            if (!videoType) {
                count = await ValidationController.indexAllStagingDirectories()
                res.status(200).send(`Successfully indexed ${count} files.\n`)
            } else if (Validators.isVideoType(videoType)) {
                const nullVideo = VideoFactory.createNullFromVideoType(videoType)
                count = await ValidationController.indexOneStagingDirectory(nullVideo)
                res.status(200).send(`Successfully indexed ${count} files.\n`)
            } else {
                throw new Error(`Passed an invalid video type.`)
            }

            GmukkoLogger.success(`${count} staging file${count > 1 ? 's' : ''} indexed.`)

        } catch (error) {
            res.sendStatus(500)
            next(error)
        }
    }

    public static async getValidationRequest(req: Request, res: Response, next: NextFunction) {
        try {
            var validationRequest: ValidationRequest = { tables: {} }
        
           for (const [, tableName] of Object.values(DatabaseTableNames).entries()) {
                validationRequest.tables[tableName] = []
                const results = await Database.getStagingDatabaseEntriesFromTable(tableName)
                for (const [, media] of results.entries()) {
                    if (Validators.isMedia(media)) {
                        validationRequest.tables[tableName].push(media)
                    }
                }
            }

            res.status(200).send(validationRequest)
            GmukkoLogger.success(`Sent validation request.`)

        } catch (error) {
            res.sendStatus(500)
            next(error)
        }
    }

    public static async postAcceptedValidationResponse(req: Request, res: Response, next: NextFunction) {
        try {

            const originalValidationResponse = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
            const validationResponseWithUpdatedFilePaths = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
            if (Validators.isValidationResponse(originalValidationResponse)) {
                await FileEngine.moveStagingFilesToProduction(validationResponseWithUpdatedFilePaths)
                await Database.moveStagingDatabaseEntriesToProduction(originalValidationResponse, validationResponseWithUpdatedFilePaths)
                res.status(200).send('Successfully processed accepted entries.\n')
            } else {
                res.status(500).send(`Invalid data type.\n`)
                next(`Data sent is not a proper validation request.`)
            }

        } catch (error) {
            res.sendStatus(500)
            next(error)
        }
    }

    public static async postRejectedValidationResponse(req: Request, res: Response, next: NextFunction) {
        try {
            const originalValidationResponse = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
            const validationResponseWithUpdatedFilePaths = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
            if (Validators.isValidationResponse(originalValidationResponse)) {
                await FileEngine.moveStagingFilesToRejected(validationResponseWithUpdatedFilePaths)
                await Database.moveStagingDatabaseEntriesToRejected(originalValidationResponse, validationResponseWithUpdatedFilePaths)
                res.status(200).send('Successfully processed rejected entries.\n')
            } else {
                res.status(500).send(`Invalid data type.\n`)
                next(`Data sent is not a proper validation request.`)
            }

        } catch (error) {
            res.sendStatus(500)
            next(error)
        }
    }



    private static async indexAllStagingDirectories(): Promise<number> {
        var count = 0

        const nullAnimation = VideoFactory.createNullFromVideoType(VideoTypes.Animation)
        count += await ValidationController.indexOneStagingDirectory(nullAnimation)

        const nullAnime = VideoFactory.createNullFromVideoType(VideoTypes.Anime)
        count += await ValidationController.indexOneStagingDirectory(nullAnime)

        const nullMovie = VideoFactory.createNullFromVideoType(VideoTypes.Movie)
        count += await ValidationController.indexOneStagingDirectory(nullMovie)

        const nullShow = VideoFactory.createNullFromVideoType(VideoTypes.Show)
        count += await ValidationController.indexOneStagingDirectory(nullShow)

        const nullStandup = VideoFactory.createNullFromVideoType(VideoTypes.Standup)
        count += await ValidationController.indexOneStagingDirectory(nullStandup)

        const nullMiscVideo = VideoFactory.createNullFromVideoType(VideoTypes.Misc)
        count += await ValidationController.indexOneStagingDirectory(nullMiscVideo)
        
        return count
    }

    private static async indexOneStagingDirectory(nullMedia: Media): Promise<number> {
        var count = 0

        try {
            const filePaths = await FileEngine.getFilePaths(nullMedia.getStagingDirectory(), nullMedia.getFileExtensions())
            const filteredFilePaths = await Database.removeAlreadyIndexedFilePaths(DatabaseNames.Staging, filePaths)
            if (filePaths.length > 0) {
                const media = await AI.parseAllMediaData(filteredFilePaths, nullMedia.getPrompt())
                if (media.length > 0) {
                    const indexCount = await Database.indexFilesIntoStagingDatabase(media)
                    indexCount ? count = indexCount : undefined
                }
            }
        } catch (error) {{
            throw new Error(`Unable to index staging directory: ${nullMedia.getStagingDirectory()}`, { cause: error })
        }}

        return count
    }
}