import { Database } from '../../../services/index.js'
import express from 'express'


const router = express.Router()

router.post('/', async (req, res) => {
    const code = await Database.backup()
    res.status(code).send(`${code}\n`)
})

export default router