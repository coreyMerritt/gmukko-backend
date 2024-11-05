import express from 'express'
import { MediaController } from '../../controllers/index.js'
import { Database } from '../../core/database.js'
import { Validators } from '../../core/validators.js'
import { VideoFactory } from '../../media/video/video_factory.js'


const router = express.Router()

router.post('/index/:mediaType?', async (req, res, next) => {
    try {
        const mediaType = req.params.mediaType
        MediaController.indexFilesIntoStagingDatabase(mediaType)
        res.status(200).send('Started indexing staging files.\n')
    } catch (error) {
        res.sendStatus(500)
        next(error)
    }
})

router.get('/pending', async (req, res, next) => {
    try {
        const validationRequest = await MediaController.createValidationRequestFromStaging()
        res.status(200).send(validationRequest)
    } catch (error) {
        res.sendStatus(500)
        next(error)
    }
})

router.post('/accepted', async (req, res, next) => {
    try {
        const originalValidationResponse = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
        const validationResponseWithUpdatedFilePaths = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
        if (Validators.isValidationResponse(originalValidationResponse)) {
            await MediaController.moveStagingFilesToProduction(validationResponseWithUpdatedFilePaths)
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
})

router.post('/rejected', async (req, res, next) => {
    try {
        const originalValidationResponse = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
        const validationResponseWithUpdatedFilePaths = VideoFactory.buildVideosInValidationResponse(structuredClone(req.body))
        if (Validators.isValidationResponse(originalValidationResponse)) {
            await MediaController.moveStagingFilesToRejects(validationResponseWithUpdatedFilePaths)
            await Database.moveStagingDatabaseEntriesToRejects(originalValidationResponse, validationResponseWithUpdatedFilePaths)
            res.status(200).send('Successfully processed rejected entries.\n')
        } else {
            res.status(500).send(`Invalid data type.\n`)
            next(`Data sent is not a proper validation request.`)
        }
    } catch (error) {
        res.sendStatus(500)
        next(error)
    }
})

export default router