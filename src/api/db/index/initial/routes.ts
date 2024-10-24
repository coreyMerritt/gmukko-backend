import { Database } from '../../../../services/index.js'
import { DatabaseNames, DatabaseTables, MediaDataTypes } from '../../../../interfaces_and_enums/index.js'
import express from 'express'


const router = express.Router()

router.post('/:mediaType?', async (req, res) => {
    if (req.params.mediaType) {
        const tableToRefresh = req.params.mediaType.toLowerCase()
        switch(tableToRefresh) {
            case MediaDataTypes.Movies:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Movies, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Movies} table in ${DatabaseNames.Staging} database.\n`)
                break
            case MediaDataTypes.Shows:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Shows, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Shows} table in ${DatabaseNames.Staging} database.\n`)
                break
            case MediaDataTypes.Standup:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Standup, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Standup} table in ${DatabaseNames.Staging} database.\n`)
                break
            case MediaDataTypes.Anime:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Anime, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Anime} table in ${DatabaseNames.Staging} database.\n`)
                break
            case MediaDataTypes.Animation:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Animation, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Animation} table in ${DatabaseNames.Staging} database.\n`)
                break
            case MediaDataTypes.Internet:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Internet, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Internet} table in ${DatabaseNames.Staging} database.\n`)
                break
            default:
                res.status(400).send(`Bad params.\n`)
                break
        }
    } else {
        res.status(200).send(`Doing initial indexing for ${DatabaseNames.Staging} database.\n`)
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Movies, '/mnt/z/media/videos/movies', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Shows, '/mnt/z/media/videos/shows', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Standup, '/mnt/z/media/videos/standup', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Anime, '/mnt/z/media/videos/anime', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Animation, '/mnt/z/media/videos/animation', [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Internet, '/mnt/z/media/videos/internet', [ '.mkv', '.avi', '.mp4', '.mov' ])
    }
})

export default router