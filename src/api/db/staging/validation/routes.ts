import express, { Router } from 'express'
import { MediaController } from '../../../../controllers/index.js'
import { Database } from '../../../../core/database.js'
import { Validators } from '../../../../core/validators.js'
import { GmukkoLogger } from '../../../../core/gmukko_logger.js'


const router = express.Router()

router.get('/pending', async (req, res, next) => {
    const validationRequest = await MediaController.getStagingMedia()
    res.status(200).send(validationRequest)
    console.log(`200: Sent Staging Media.`)
})

router.post('/accepted', async (req, res, next) => {
    try {
        const originalRequest = structuredClone(req.body)
        const updatedRequest = structuredClone(req.body)
        if (Validators.isValidationRequest(originalRequest)) {
            await MediaController.moveStagingFilesToProduction(updatedRequest)
            await Database.moveStagingDatabaseEntriesToProduction(originalRequest, updatedRequest)
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