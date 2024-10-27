import { Database, GmukkoLogger } from '../core/index.js'
import cron from 'node-cron'
import fs from 'fs'
import http from 'http'
import express from 'express'
import initialIndexRoutes from '../api/db/staging/index/routes.js'
import dbBackupRoutes from '../api/db/backup/routes.js'
import validationRoutes from '../api/db/staging/validation/routes.js'
import { BackupDirectories, CoreDirectories, LogPaths, ProductionDirectories, StagingDirectories } from '../configuration/index.js'


class Start {
    private port = 3080

    public async execute() {
        this.createDirectories()
        this.startApp()
        this.startPassiveJobs()
    }



    private async createDirectories() {
        var directoriesToCreate: string[] = []
        directoriesToCreate.push(...(Object.values(BackupDirectories)))
        directoriesToCreate.push(...(Object.values(CoreDirectories)))
        directoriesToCreate.push(...(Object.values(LogPaths)))
        directoriesToCreate.push(...(Object.values(StagingDirectories)))
        directoriesToCreate.push(...(Object.values(ProductionDirectories)))
    
        for (const [, path] of directoriesToCreate.entries()) {
            try {
                fs.mkdirSync(path)
            } catch (error) {
                // Not a genuine error, directory exists
            }   
        }
    }

    private async startApp() {
        const app = express()
        const server = http.createServer(app)

        server.listen(this.port, () => {
            GmukkoLogger.success(`Server is running on http://localhost:${this.port}`)
        })

        app.use(express.json({ limit: '1gb' }))

        app.use((req, res, next) => {
            GmukkoLogger.incomingRequest(req)
            next()
        })

        app.use(`/db/backup`, dbBackupRoutes)
        app.use(`/db/staging/index`, initialIndexRoutes)
        app.use(`/db/staging/validation`, validationRoutes)
        app.use(GmukkoLogger.error)
    }

    private async startPassiveJobs() {
        cron.schedule('0 0 * * *', () => {
            Database.backupAll()
        }, 
        {
            timezone: 'America/Detroit'
        })
    }
}

new Start().execute()