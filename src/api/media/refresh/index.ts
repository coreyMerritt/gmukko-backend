import express from 'express'
import { MediaFiles } from '../../../services/media_files.js'

const router = express.Router()

router.post('/', async (req, res) => {
    const mediaFiles = await MediaFiles.getMediaFiles('/mnt/z/media/videos/movies', ['.mp4', '.avi', '.mkv', '.mov'])
})

export default router