import { MediaController } from '../../../../controllers/index.js'
import express from 'express'


const router = express.Router()

router.post('/:mediaType?', async (req, res, next) => {
    try {
        const mediaType = req.params.mediaType
        MediaController.indexStaging(mediaType)
        res.status(200).send('Started indexing staging files.\n')
    } catch (error) {
        res.sendStatus(500)
        next(error)
    }
})

export default router