import { GmukkoTime } from './gmukko_time.js'
import { LogFiles } from '../configuration/index.js'
import fs from 'fs/promises'
import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { VideoTypes } from '../media/video/video.js'
import chalk from 'chalk'

const blue = chalk.blue
const cyan = chalk.cyan
const green = chalk.green
const orange = chalk.rgb(255, 165, 0)
const red = chalk.red

export class GmukkoLogger {

    static async incomingRequest(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>) {
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


    static async info(info: string) {
        this.logTimestamp()
        process.stdout.write(`${info}\n`)

        fs.appendFile(`${LogFiles.Default}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }

    static async data(tag: string, data: string) {
        this.logTimestamp()
        process.stdout.write(`${tag}: ${cyan(data)}\n`)

        fs.appendFile(`${LogFiles.Default}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `${tag}: ${data}\n\n`
        )
    }

    static async important(info: string) {
        this.logTimestamp()
        process.stdout.write(`${orange(info)}\n`)

        fs.appendFile(`${LogFiles.Default}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }

    static async success(info: string) {
        this.logTimestamp()
        process.stdout.write(`${green(info)}\n`)

        fs.appendFile(`${LogFiles.Default}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }


    static async error(info: string, error?: unknown) {
        this.logTimestamp()
        if (error) {
            process.stderr.write(`${red(info)}\n${red(error)}\n`)

            fs.appendFile(`${LogFiles.Default}`, 
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

            fs.appendFile(`${LogFiles.Default}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
            fs.appendFile(`${LogFiles.Errors}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
        }
    }

    private static async logTimestamp() {
        process.stdout.write(blue(`[${GmukkoTime.getCurrentTime()}] `))
    }
}