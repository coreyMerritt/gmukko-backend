import { GmukkoLogger } from "../core/gmukko_logger.js"
import { GmukkoTime } from "../core/gmukko_time.js"
import { LogFiles } from '../configuration/directories/index.js'
import fs from 'fs/promises'
import chalk from 'chalk'
import { Request, Response, NextFunction } from "express"

const blue = chalk.blue

export class RequestMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
        process.stdout.write(`\n`)
        GmukkoLogger.logTimestamp()
        process.stdout.write(blue(`Request Recieved\n\n`))

        fs.appendFile(`${LogFiles.IncomingRequest}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `\tURL: ${req.url}\n` +
            `\tMethod: ${req.method}\n` +
            `\tIP: ${req.socket.remoteAddress}\n` +
            `\tUser-Agent: ${req.headers['user-agent']}\n` +
            `\tHeaders: ${JSON.stringify(req.headers, null, 2)}\n\n`
        )

        next()
    }
}