import { GmukkoTime } from './gmukko_time.js'
import { LogFiles } from '../configuration/directories/index.js'
import fs from 'fs/promises'
import chalk from 'chalk'

const blue = chalk.blue
const cyan = chalk.cyan
const green = chalk.green
const orange = chalk.rgb(255, 165, 0)
const red = chalk.red

export class GmukkoLogger {

    public static async info(info: string): Promise<void> {
        GmukkoLogger.logTimestamp()
        process.stdout.write(`${info}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }

    public static async error(error?: Error): Promise<void> {
        if (error) {
            GmukkoLogger.logTimestamp()
            process.stderr.write(`${red(error.message)}\n`)
            process.stderr.write(`${red(error.stack)}\n`)

            fs.appendFile(`${LogFiles.General}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `${error.message}\n\n`
            )
            fs.appendFile(`${LogFiles.Errors}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `${error.message}\n\n`
            )
        } else {
            GmukkoLogger.logTimestamp()
            process.stderr.write(`${red(`An undefined error has occured.`)}\n`)
            fs.appendFile(`${LogFiles.General}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `${`An undefined error has occured.`}\n\n`
            )
            fs.appendFile(`${LogFiles.Errors}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `${`An undefined error has occured.`}\n\n`
            )
        }
    }

    public static async data(tag: string, data: string): Promise<void> {
        GmukkoLogger.logTimestamp()
        process.stdout.write(`${tag}: ${cyan(data)}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `${tag}: ${data}\n\n`
        )
    }

    public static async important(info: string): Promise<void> {
        GmukkoLogger.logTimestamp()
        process.stdout.write(`${orange(info)}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }

    public static async success(info: string): Promise<void> {
        GmukkoLogger.logTimestamp()
        process.stdout.write(`${green(info)}\n`)

        fs.appendFile(`${LogFiles.General}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }

    public static async logTimestamp(): Promise<void> {
        process.stdout.write(blue(`[${GmukkoTime.getCurrentTime()}] `))
    }
}