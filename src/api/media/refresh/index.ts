import express from 'express'
import { MediaFiles } from '../../../services/media_files.js'

const router = express.Router()

router.post('/', async (req, res) => {
    const mediaFiles = await MediaFiles.getMediaFiles('/mnt/z/media/videos/movies/(2017)-1922/', ['.mp4', '.avi', '.mkv', '.mov'])
})

export default router