import { MediaController } from '../../../../controllers/index.js'
import express from 'express'


const router = express.Router()

router.post('/', async (req, res) => {
    MediaController.indexStaging(req, res)
    res.status(200).send(`Attempting to stage new files.\n`)
})

export default router