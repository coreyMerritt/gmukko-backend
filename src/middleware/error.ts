import { GmukkoLogger } from '../core/gmukko_logger.js'

export class ErrorMiddleware {
    public static async execute(error: Error): Promise<void> { 
        GmukkoLogger.error(error)
    }
}