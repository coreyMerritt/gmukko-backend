import { LikiLogger } from '../core/liki_logger.js'

export class ErrorMiddleware {
    public static async execute(error: Error): Promise<void> { 
        LikiLogger.error(error)
    }
}