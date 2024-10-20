import express from 'express'
import Database from '../../../services/db.js'

const router = express.Router()

router.post('/', async (req, res) => {
    Database.refreshMediaDataTable()
})

export default router