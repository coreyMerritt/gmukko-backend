import { GmukkoTime } from './gmukko_time.js'
import { LogFiles } from '../configuration/directories/index.js'
import fs from 'fs/promises'
import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import chalk from 'chalk'

const blue = chalk.blue
const cyan = chalk.cyan
const green = chalk.green
const orange = chalk.rgb(255, 165, 0)
const red = chalk.red

export class GmukkoLogger {

    public static async incomingRequest(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): Promise<void> {
        process.stdout.write(`\n`)
        this.logTimestamp()
        process.stdout.write(blue(`Request Recieved\n\n`))

        fs.appendFile(`${LogFiles.IncomingRequest}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `\tURL: ${req.url}\n` +
            `\tMethod: ${req.method}\n` +
            `\tIP: ${req.socket.remoteAddress}\n` +
            `\tUser-Agent: ${req.headers['user-agent']}\n` +
            `\tHeaders: ${JSON.stringify(req.headers, null, 2)}\n\n`
        )
    }


    public static async info(info: string): Promise<void> {
        this.logTimestamp()
        process.stdout.write(`${info}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }

    public static async data(tag: string, data: string): Promise<void> {
        this.logTimestamp()
        process.stdout.write(`${tag}: ${cyan(data)}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `${tag}: ${data}\n\n`
        )
    }

    public static async important(info: string): Promise<void> {
        this.logTimestamp()
        process.stdout.write(`${orange(info)}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }

    public static async success(info: string): Promise<void> {
        this.logTimestamp()
        process.stdout.write(`${green(info)}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }


    public static async error(info: string, error?: unknown): Promise<void> {
        this.logTimestamp()
        if (error) {
            process.stderr.write(`${red(info)}\n${red(error)}\n`)

            fs.appendFile(`${LogFiles.General}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n` +
                `${error}\n\n`
            )
            fs.appendFile(`${LogFiles.Errors}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n` +
                `${error}\n\n`
            )   

        } else {
            process.stderr.write(`${red(info)}\n`)

            fs.appendFile(`${LogFiles.General}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
            fs.appendFile(`${LogFiles.Errors}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
        }
    }

    private static async logTimestamp(): Promise<void> {
        process.stdout.write(blue(`[${GmukkoTime.getCurrentTime()}] `))
    }
}