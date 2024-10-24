import { Database } from './index.js'
import { BackupPaths, CorePaths, LogFiles, LogPaths, StagingPaths } from '../interfaces_and_enums/paths/index.js'
import fs from 'fs/promises'
import cron from 'node-cron'


export class Startup {
    public static async execute() {
        for (const path in (BackupPaths && CorePaths && LogPaths && StagingPaths)) {
            try {
                await fs.mkdir(path)
            } catch (error) {
                // Not a genuine error
            }   
        }

        cron.schedule('0 0 * * *', () => {
            Database.backup()
        }, {
            timezone: 'UTC'
        })
    }
}