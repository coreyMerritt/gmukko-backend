import express from 'express'
import Database from '../../../services/db.js'
import { DatabaseTables } from '../../../interfaces_and_enums/database_tables.js'

const router = express.Router()

router.post('/', async (req, res) => {
    Database.refreshTable(DatabaseTables.StandupFileData, '/mnt/z/media/videos/stand-up', [ '.mkv', '.avi', '.mp4', '.mov' ])
})

export default router