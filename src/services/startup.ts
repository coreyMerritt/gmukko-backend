import fs from 'fs/promises'
import { LoggingPaths } from '../interfaces_and_enums/logging_paths.js'
import { BackupPaths } from '../interfaces_and_enums/backup_directories.js'
import cron from 'node-cron'
import Database from './db.js'

export default class Startup {
    public static async execute() {
        try {
            await fs.mkdir(LoggingPaths.LogsDirectory)
            await fs.mkdir(BackupPaths.DefaultDirectory)
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