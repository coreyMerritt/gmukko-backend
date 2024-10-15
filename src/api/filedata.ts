import express from 'express'

const router = express.Router()

router.get('/filedata', (req, res) => {
    res.json({ message: 'File Data' })
})

export default router