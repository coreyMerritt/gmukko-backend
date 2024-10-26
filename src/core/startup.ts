import { Database } from './database.js'
import { BackupDirectories, CoreDirectories, LogPaths, StagingPaths } from '../configuration/index.js'
import fs from 'fs/promises'
import cron from 'node-cron'


export class Startup {

    public static async execute() {
        var directoriesToCreate: string[] = []
        directoriesToCreate.push(...(Object.values(BackupDirectories)))
        directoriesToCreate.push(...(Object.values(CoreDirectories)))
        directoriesToCreate.push(...(Object.values(LogPaths)))
        directoriesToCreate.push(...(Object.values(StagingPaths)))

        for (const [, path] of directoriesToCreate.entries()) {
            try {
                await fs.mkdir(path)
            } catch (error) {
                // Not a genuine error, directory exists
            }   
        }

        cron.schedule('0 0 * * *', () => {
            Database.backup()
        }, {
            timezone: 'UTC'
        })
    }
}