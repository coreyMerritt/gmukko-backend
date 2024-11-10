import { Database, GmukkoLogger } from '../core/index.js'
import cron from 'node-cron'
import fs from 'fs'
import http from 'http'
import express from 'express'
import backupRoutes from '../api/routes/backup.js'
import validationRoutes from '../api/routes/validation.js'
import { BackupDirectories, CoreDirectories, LogPaths, ProductionDirectories, RejectDirectories, StagingDirectories } from '../configuration/directories/index.js'
import { ErrorMiddleware, RequestMiddleware } from '../middleware/index.js'


export class Start {

    private static port = process.env.GMUKKO_BACKEND_PORT
    private static protocol = process.env.GMUKKO_BACKEND_PROTOCOL
    public static url = `${this.protocol}://localhost:${this.port}`
    public static test: boolean

    public static async execute(test?: boolean): Promise<void> {
        Start.test = test ? true : false 
        this.createDirectories()
        this.startApp()
        this.startPassiveJobs()
        
        if (test) {
            Database.initialize(true)
        } else {
            Database.initialize(false)
        }

    }

    

    private static async createDirectories(): Promise<void> {
        var directoriesToCreate: string[] = []
        directoriesToCreate.push(...(Object.values(BackupDirectories)))
        directoriesToCreate.push(...(Object.values(CoreDirectories)))
        directoriesToCreate.push(...(Object.values(LogPaths)))
        directoriesToCreate.push(...(Object.values(StagingDirectories)))
        directoriesToCreate.push(...(Object.values(ProductionDirectories)))
        directoriesToCreate.push(...(Object.values(RejectDirectories)))
    
        for (const [, path] of directoriesToCreate.entries()) {
            try {
                fs.mkdirSync(path)
            } catch {
                // Not a genuine error, directory exists
            }   
        }
    }

    private static async startApp(): Promise<void> {
        const app = express()
        const server = http.createServer(app)

        server.listen(Start.port, () => {
            GmukkoLogger.success(`Server is running on ${Start.url}`)
        })
        app.use(express.json({ limit: '1gb' }))

        app.use(RequestMiddleware.execute)
        app.use(`/`, backupRoutes, validationRoutes)
        app.use(ErrorMiddleware.execute)
    }


    private static async startPassiveJobs(): Promise<void> {
        cron.schedule('0 0 * * *', () => {
            Database.backupAll()
        }, 
        {
            timezone: 'America/Detroit'
        })
    }
}

Start.execute()