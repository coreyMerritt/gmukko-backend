import { GmukkoTime } from './gmukko_time.js'
import { LogFiles } from '../configuration/index.js'
import fs from 'fs/promises'
import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { VideoTypes } from '../media/video/video.js'


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


    static async invalidJsonArray(prompt: string, data: string[], response: string) {
        this.error(`Invalid Json Array.`)
        fs.appendFile(`${LogFiles.InvalidJsonArray}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Prompt: ${prompt}\n` +
            `Data: ${data.toString()}\n` +
            `Response: ${response}\n\n`
        )
    }


    static async invalidVideoData(object: any, expectedVideoType?: VideoTypes) {
        this.error(`Invalid Video Data.`)
        const logPath = this.determineLogPath(expectedVideoType)
        const filePath = 'filePath' in object ? object.filePath : "filePath not on object."
        fs.appendFile(`${logPath}}`, 
            `[${GmukkoTime.getCurrentDateTime()}]\n` +
            `Filepath: ${filePath}\n` +
            `Object: ${JSON.stringify(object)}\n\n`
        )
    }

    private static determineLogPath(expectedVideoType: VideoTypes | undefined) {
        switch (expectedVideoType) {
            case VideoTypes.Movie:
                return LogFiles.InvalidMovieData
            case VideoTypes.Show:
                return LogFiles.InvalidShowData
            case VideoTypes.Standup:
                return LogFiles.InvalidStandupData
            case VideoTypes.Anime:
                return LogFiles.InvalidAnimeData
            case VideoTypes.Animation:
                return LogFiles.InvalidAnimationData
            default:
                return LogFiles.InvalidVideoData
        }
    }
}