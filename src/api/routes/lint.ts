import express from 'express'
import asyncHandler from 'express-async-handler'
import { LintController } from '../controllers/lint.js'


const router = express.Router()

router.route(`/lint/:databaseName?/:mediaType?/:secondaryType?`)
    .post(asyncHandler(LintController.lintDatabase))

export default router