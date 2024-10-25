import { GmukkoTime } from './gmukko_time.js'
import { VideoDataTypes, Prompts } from '../configuration/index.js'
import { LogFiles } from '../configuration/index.js'
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
        console.log(info)
        fs.appendFile(`${LogFiles.Default}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }


    static async error(info: string, error?: unknown) {
        if (error) {
            console.error(`${info}\n${error}`)
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
            console.error(`${info}`)
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


    static async debug(info: string) {
        fs.appendFile(`${LogFiles.Debug}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `${info}\n\n`
        )
    }


    static async invalidJsonArray(prompt: Prompts, data: string[], response: string) {
        this.error(`Invalid Json Array.`)
        fs.appendFile(`${LogFiles.InvalidJsonArray}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Prompt: ${prompt}\n` +
            `Data: ${data.toString()}\n` +
            `Response: ${response}\n\n`
        )
    }


    static async invalidVideoData(object: any, expectedVideoType?: VideoDataTypes) {
        this.error(`Invalid Video Data.`)
        const logPath = this.determineLogPath(expectedVideoType)
        const filePath = 'filePath' in object ? object.filePath : "filePath not on object."
        fs.appendFile(`${logPath}}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Filepath: ${filePath}\n` +
            `Object: ${JSON.stringify(object)}\n\n`
        )
    }

    private static determineLogPath(expectedVideoType: VideoDataTypes | undefined) {
        switch (expectedVideoType) {
            case VideoDataTypes.Movies:
                return LogFiles.InvalidMovieData
            case VideoDataTypes.Shows:
                return LogFiles.InvalidShowData
            case VideoDataTypes.Standup:
                return LogFiles.InvalidStandupData
            case VideoDataTypes.Anime:
                return LogFiles.InvalidAnimeData
            case VideoDataTypes.Animation:
                return LogFiles.InvalidAnimationData
            case VideoDataTypes.Internet:
                return LogFiles.InvalidInternetData
            default:
                return LogFiles.InvalidVideoData
        }
    }
}