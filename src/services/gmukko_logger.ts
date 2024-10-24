import { GmukkoTime } from './index.js'
import { LoggingPaths, MediaDataTypes, Prompts } from '../interfaces_and_enums/index.js'
import fs from 'fs/promises'
import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'


export class GmukkoLogger {

    static async incomingRequest(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>) {
        console.log(`\nRequest received:\n` +
            `\t[${GmukkoTime.getCurrentDateTime()}]\n` +
            `\tURL: ${req.url}\n` +
            `\tMethod: ${req.method}\n` +
            `\tIP: ${req.socket.remoteAddress}\n` +
            `\tUser-Agent: ${req.headers['user-agent']}\n` +
            `\tHeaders: ${JSON.stringify(req.headers, null, 2)}\n`
        )
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.IncomingRequest}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `\tURL: ${req.url}\n` +
            `\tMethod: ${req.method}\n` +
            `\tIP: ${req.socket.remoteAddress}\n` +
            `\tUser-Agent: ${req.headers['user-agent']}\n` +
            `\tHeaders: ${JSON.stringify(req.headers, null, 2)}\n\n`
        )
    }


    static async info(info: string) {
        console.log(info)
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Default}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }


    static async error(info: string, error?: unknown) {
        if (error) {
            console.error(`${info}\n${error}`)
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Default}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n` +
                `${error}\n\n`
            )
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Errors}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n` +
                `${error}\n\n`
            )   
        } else {
            console.error(`${info}`)
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Default}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Errors}`, 
                `[${GmukkoTime.getCurrentDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
        }
    }


    static async debug(info: string) {
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Debug}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `${info}\n\n`
        )
    }


    static async invalidJsonArray(prompt: Prompts, data: string[], response: string) {
        this.error(`Invalid Json Array.`)
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.InvalidJsonArray}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Prompt: ${prompt}\n` +
            `Data: ${data.toString()}\n` +
            `Response: ${response}\n\n`
        )
    }


    static async invalidMediaData(object: any, expectedMediaType?: MediaDataTypes) {
        this.error(`Invalid Media Data.`)
        const logPath = this.determineLogPath(expectedMediaType)
        const filePath = 'filePath' in object ? object.filePath : "filePath not on object."
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${logPath}}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Filepath: ${filePath}\n` +
            `Object: ${JSON.stringify(object)}\n\n`
        )
    }

    private static determineLogPath(expectedMediaType: MediaDataTypes | undefined) {
        switch (expectedMediaType) {
            case MediaDataTypes.Movies:
                return LoggingPaths.InvalidMovieData
            case MediaDataTypes.Shows:
                return LoggingPaths.InvalidShowData
            case MediaDataTypes.Standup:
                return LoggingPaths.InvalidStandupData
            case MediaDataTypes.Anime:
                return LoggingPaths.InvalidAnimeData
            case MediaDataTypes.Animation:
                return LoggingPaths.InvalidAnimationData
            case MediaDataTypes.Internet:
                return LoggingPaths.InvalidInternetData
            default:
                return LoggingPaths.InvalidMediaData
        }
    }
}