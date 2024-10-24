import { Database } from './index.js'
import { BackupPaths, LoggingPaths } from '../interfaces_and_enums/paths/index.js'
import fs from 'fs/promises'
import cron from 'node-cron'


export class Startup {
    public static async execute() {
        try {
            await fs.mkdir(LoggingPaths.LogsDirectory)
            await fs.mkdir(BackupPaths.Output)
        } catch (error) {
            // Not a genuine error
        }

        cron.schedule('0 0 * * *', () => {
            Database.backupDatabase()
        }, {
            timezone: 'UTC'
        })
    }
}