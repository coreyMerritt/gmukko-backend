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
                Database.refreshTable(DatabaseTables.MovieFileData, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.sendStatus(200)
                break
            case MediaFileDataTypes.Shows:
                Database.refreshTable(DatabaseTables.ShowFileData, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.sendStatus(200)
                break
            case MediaFileDataTypes.Standup:
                Database.refreshTable(DatabaseTables.StandupFileData, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.sendStatus(200)
                break
            case MediaFileDataTypes.Anime:
                Database.refreshTable(DatabaseTables.AnimeFileData, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.sendStatus(200)
                break
            case MediaFileDataTypes.Animation:
                Database.refreshTable(DatabaseTables.AnimationFileData, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.sendStatus(200)
                break
            case MediaFileDataTypes.Internet:
                Database.refreshTable(DatabaseTables.InternetFileData, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.sendStatus(200)
                break
            default:
                res.sendStatus(400)
                break
        }
    } else {
        res.sendStatus(200)
        await Database.refreshTable(DatabaseTables.MovieFileData, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.ShowFileData, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.StandupFileData, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.AnimeFileData, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.AnimationFileData, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.InternetFileData, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
    }
})

export default router