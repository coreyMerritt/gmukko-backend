import fs from 'fs/promises'
import { LoggingPaths } from '../interfaces_and_enums/logging_paths.js'
import GmukkoTime from './gmukko_time.js'
import { Prompts } from '../interfaces_and_enums/prompts.js'
import express from 'express'
import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import { MediaFileDataTypes } from '../interfaces_and_enums/video_file_data_types.js'

export default class GmukkoLogger {


    static async incomingRequest(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>) {
        console.log(`\nRequest received:\n` +
            `\t[${GmukkoTime.getCustomFormatDateTime()}]\n` +
            `\tURL: ${req.url}\n` +
            `\tMethod: ${req.method}\n` +
            `\tIP: ${req.socket.remoteAddress}\n` +
            `\tUser-Agent: ${req.headers['user-agent']}\n` +
            `\tHeaders: ${JSON.stringify(req.headers, null, 2)}\n`
        )
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.IncomingRequest}`, 
            `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
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
            `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
            `Info: ${info}\n\n`
        )
    }


    static async error(info: string, error?: unknown) {
        if (error) {
            console.error(`${info}\n${error}`)
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Default}`, 
                `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
                `Error: ${info}\n` +
                `${error}\n\n`
            )
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Errors}`, 
                `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
                `Error: ${info}\n` +
                `${error}\n\n`
            )   
        } else {
            console.error(`${info}`)
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Default}`, 
                `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
            fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.Errors}`, 
                `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
                `Error: ${info}\n\n`
            )
        }
    }


    static async invalidJsonArray(prompt: Prompts, data: string[], response: string) {
        console.error("Invalid Json Array.")
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${LoggingPaths.InvalidJsonArray}`, 
            `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
            `Prompt: ${prompt}\n` +
            `Data: ${data.toString()}\n` +
            `Response: ${response}\n\n`
        )
    }


    static async invalidMediaData(object: any, expectedMediaType?: MediaFileDataTypes) {
        console.error("Invalid Media Data.")
        const logPath = this.determineLogPath(expectedMediaType)
        const filePath = 'filePath' in object ? object.filePath : "filePath not on object."
        fs.appendFile(`${LoggingPaths.LogsDirectory}/${logPath}}`, 
            `[${GmukkoTime.getCustomFormatDateTime()}]\n` +
            `Filepath: ${filePath}\n` +
            `Object: ${JSON.stringify(object)}\n\n`
        )
    }

    private static determineLogPath(expectedMediaType: MediaFileDataTypes | undefined) {
        switch (expectedMediaType) {
            case MediaFileDataTypes.Movies:
                return LoggingPaths.InvalidMovieData
            case MediaFileDataTypes.Shows:
                return LoggingPaths.InvalidShowData
            case MediaFileDataTypes.Standup:
                return LoggingPaths.InvalidStandupData
            case MediaFileDataTypes.Anime:
                return LoggingPaths.InvalidAnimeData
            case MediaFileDataTypes.Animation:
                return LoggingPaths.InvalidAnimationData
            case MediaFileDataTypes.Internet:
                return LoggingPaths.InvalidInternetData
            default:
                return LoggingPaths.InvalidMediaData
        }
    }
}