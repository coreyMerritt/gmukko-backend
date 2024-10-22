import express from 'express'
import Database from '../../../services/db.js'
import { DatabaseTables } from '../../../interfaces_and_enums/database_tables.js'
import { MediaFileDataTypes } from '../../../interfaces_and_enums/video_file_data_types.js'

const router = express.Router()

router.post('/:mediaType?', async (req, res) => {
    if (req.params.mediaType) {
        const tableToRefresh = req.params.mediaType.toLowerCase()
        switch(tableToRefresh) {
            case MediaFileDataTypes.Movies:
                Database.refreshTable(DatabaseTables.Movies, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.Movies}\n`)
                break
            case MediaFileDataTypes.Shows:
                Database.refreshTable(DatabaseTables.Shows, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.Shows}\n`)
                break
            case MediaFileDataTypes.Standup:
                Database.refreshTable(DatabaseTables.Standup, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.Standup}\n`)
                break
            case MediaFileDataTypes.Anime:
                Database.refreshTable(DatabaseTables.Anime, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.Anime}\n`)
                break
            case MediaFileDataTypes.Animation:
                Database.refreshTable(DatabaseTables.Animation, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.Animation}\n`)
                break
            case MediaFileDataTypes.Internet:
                Database.refreshTable(DatabaseTables.Internet, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.Internet}\n`)
                break
            default:
                res.status(400).send(`Bad params.\n`)
                break
        }
    } else {
        res.status(200).send(`Refreshing all tables.\n`)
        await Database.refreshTable(DatabaseTables.Movies, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.Shows, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.Standup, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.Anime, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.Animation, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.Internet, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
    }
})

export default router