import express, { Router } from 'express'
import { MediaController } from '../../../../controllers/index.js'
import { Database } from '../../../../core/database.js'
import { Validators } from '../../../../core/validators.js'
import { GmukkoLogger } from '../../../../core/gmukko_logger.js'


const router = express.Router()

router.get('/pending', async (req, res, next) => {
    const validationRequest = await MediaController.getStagingMedia()
    if (validationRequest.tables !== undefined) {
        res.status(200).send(validationRequest)
        console.log(`200: Send Staging Media.`)
    } else {
        res.status(204).send(`204\n`)
        console.log(`204: No Staging Media Found.`)
    }
})

router.post('/accepted', async (req, res, next) => {
    try {
        const validationRequest = req.body
        if (Validators.isValidationRequest(validationRequest)) {
            const validationRequestWithNewFilePaths = await MediaController.moveStagingFilesToProduction(validationRequest)
            await Database.moveStagingDatabaseEntriesToProduction(validationRequestWithNewFilePaths)
            res.status(200).send('Success\n')
        }
    } catch (error) {
        res.status(500).send(`500\n`)
        next(error)
    }
})

router.post('/rejected', async (req, res) => {
    console.log(req.body)
    res.status(200).send('Success\n')
})

export default router