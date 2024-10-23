import express from 'express'
import Database from '../../../../services/db.js'
import { DatabaseTables } from '../../../../interfaces_and_enums/database_tables.js'
import { MediaFileDataTypes } from '../../../../interfaces_and_enums/video_file_data_types.js'

const router = express.Router()

router.post('/:mediaType?', async (req, res) => {
    if (req.params.mediaType) {
        const tableToRefresh = req.params.mediaType.toLowerCase()
        switch(tableToRefresh) {
            case MediaFileDataTypes.Movies:
                Database.refreshTable(DatabaseTables.StagingMovies, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.StagingMovies}\n`)
                break
            case MediaFileDataTypes.Shows:
                Database.refreshTable(DatabaseTables.StagingShows, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.StagingShows}\n`)
                break
            case MediaFileDataTypes.Standup:
                Database.refreshTable(DatabaseTables.StagingStandup, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.StagingStandup}\n`)
                break
            case MediaFileDataTypes.Anime:
                Database.refreshTable(DatabaseTables.StagingAnime, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.StagingAnime}\n`)
                break
            case MediaFileDataTypes.Animation:
                Database.refreshTable(DatabaseTables.StagingAnimation, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.StagingAnimation}\n`)
                break
            case MediaFileDataTypes.Internet:
                Database.refreshTable(DatabaseTables.StagingInternet, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Refreshing ${DatabaseTables.StagingInternet}\n`)
                break
            default:
                res.status(400).send(`Bad params.\n`)
                break
        }
    } else {
        res.status(200).send(`Refreshing all tables.\n`)
        await Database.refreshTable(DatabaseTables.StagingMovies, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.StagingShows, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.StagingStandup, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.StagingAnime, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.StagingAnimation, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseTables.StagingInternet, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
    }
})

export default router