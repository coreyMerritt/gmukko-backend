import express from 'express'
import asyncHandler from 'express-async-handler'
import { ValidationController } from '../controllers/validation.js'


const router = express.Router()

router.route('/validation/index/:mediaType?')
    .post(asyncHandler(ValidationController.indexStaging))

router.route('/validation/pending')
    .get(asyncHandler(ValidationController.getValidationRequest))

router.route('/validation/accepted')
    .post(asyncHandler(ValidationController.postAcceptedValidationResponse))

router.route('/validation/rejected')
    .post(asyncHandler(ValidationController.postRejectedValidationResponse))

export default router