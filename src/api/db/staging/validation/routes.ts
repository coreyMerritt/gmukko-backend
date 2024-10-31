import express from 'express'
import { MediaController } from '../../../../controllers/index.js'
import { Database } from '../../../../core/database.js'
import { Validators } from '../../../../core/validators.js'


const router = express.Router()

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
        const originalValidationReponse = req.body
        if (Validators.isValidationResponse(originalValidationReponse)) {
            const validationReponseWithUpdatedFilePaths = structuredClone(req.body)
            await MediaController.moveStagingFilesToProduction(validationReponseWithUpdatedFilePaths)
            await Database.moveStagingDatabaseEntriesToProduction(originalValidationReponse, validationReponseWithUpdatedFilePaths)
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
        res.status(200).send('Successfully processed rejected entries.\n')
    } catch (error) {
        res.sendStatus(500)
        next(error)
    }
})

export default router