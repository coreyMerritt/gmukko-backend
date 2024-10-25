import { MediaController } from '../../../../controllers/index.js'
import express from 'express'


const router = express.Router()

router.post('/:mediaType?', async (req, res) => {
    const mediaType = req.params.mediaType
    try {
        MediaController.indexStaging(mediaType)
        res.status(200).send(`Attempting to stage new files.\n`)
    } catch (error) {
        res.status(500).send(`Something went wrong.\n${error}\n`)
    }
})

export default router