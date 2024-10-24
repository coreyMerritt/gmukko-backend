import { Database } from '../../../../services/index.js'
import { DatabaseNames, DatabaseTables, VideoDataTypes } from '../../../../interfaces_and_enums/index.js'
import { StagingPaths } from '../../../../interfaces_and_enums/paths/index.js'
import express from 'express'


const router = express.Router()

router.post('/:videoType?', async (req, res) => {
    if (req.params.videoType) {
        const tableToRefresh = req.params.videoType.toLowerCase()
        switch(tableToRefresh) {
            case VideoDataTypes.Movies:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Movies, StagingPaths.Movies, [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Movies} table in ${DatabaseNames.Staging} database.\n`)
                break
            case VideoDataTypes.Shows:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Shows, StagingPaths.Shows, [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Shows} table in ${DatabaseNames.Staging} database.\n`)
                break
            case VideoDataTypes.Standup:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Standup, StagingPaths.Standup, [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Standup} table in ${DatabaseNames.Staging} database.\n`)
                break
            case VideoDataTypes.Anime:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Anime, StagingPaths.Anime, [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Anime} table in ${DatabaseNames.Staging} database.\n`)
                break
            case VideoDataTypes.Animation:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Animation, StagingPaths.Animation, [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Animation} table in ${DatabaseNames.Staging} database.\n`)
                break
            case VideoDataTypes.Internet:
                Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Internet, StagingPaths.Internet, [ '.mkv', '.avi', '.mp4', '.mov' ])
                res.status(200).send(`Doing initial indexing for ${DatabaseTables.Internet} table in ${DatabaseNames.Staging} database.\n`)
                break
            default:
                res.status(400).send(`Bad params.\n`)
                break
        }
    } else {
        res.status(200).send(`Doing initial indexing for ${DatabaseNames.Staging} database.\n`)
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Movies, StagingPaths.Movies, [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Shows, StagingPaths.Shows, [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Standup, StagingPaths.Standup, [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Anime, StagingPaths.Anime, [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Animation, StagingPaths.Animation, [ '.mkv', '.avi', '.mp4', '.mov' ])
        await Database.refreshTable(DatabaseNames.Staging, DatabaseTables.Internet, StagingPaths.Internet, [ '.mkv', '.avi', '.mp4', '.mov' ])
    }
})

export default router