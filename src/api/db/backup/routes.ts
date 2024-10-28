import { Database } from '../../../core/index.js'
import express from 'express'


const router = express.Router()

router.post('/', async (req, res, next) => {
    try {
        await Database.backupAll()
        res.status(200).send('Successfully backed up all databases.\n')
    } catch (error) {
        res.sendStatus(500)
        next(error)
    }
})

export default router