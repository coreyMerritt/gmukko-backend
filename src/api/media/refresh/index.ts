import express from 'express'
import { Files } from '../../../services/files.js'

const router = express.Router()

router.post('/', async (req, res) => {
    const mediaFiles = await Files.getMediaFiles('/mnt/z/media/videos/movies', ['.mp4', '.avi', '.mkv', '.mov'])
})

export default router