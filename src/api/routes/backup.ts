import express from 'express'
import asyncHandler from 'express-async-handler'
import { BackupController } from '../controllers/backup.js'


const router = express.Router()

router.route('/backup')
    .post(asyncHandler(BackupController.backUpAllDatabases))

export default router