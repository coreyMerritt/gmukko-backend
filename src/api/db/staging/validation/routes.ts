import express from 'express'
import { MediaController } from '../../../../controllers/index.js'


const router = express.Router()

router.get('/pending', async (req, res) => {
    const validationRequest = await MediaController.getStagingMedia()
    if (validationRequest.tables !== undefined) {
        res.status(200).send(validationRequest)
        console.log(`200: Send Staging Media.`)
    } else {
        res.status(204).send(`204\n`)
        console.log(`204: No Staging Media Found.`)
    }
})

router.post('/accepted', async (req, res) => {
    console.log(req.body)
    res.status(200).send('Success\n')
})

router.post('/rejected', async (req, res) => {
    console.log(req.body)
    res.status(200).send('Success\n')
})

export default router