import express from 'express'
import Database from '../../../services/db.js'

const router = express.Router()

router.post('/', async (req, res) => {
    const code = await Database.backupDatabase()
    res.sendStatus(code)
})

export default router