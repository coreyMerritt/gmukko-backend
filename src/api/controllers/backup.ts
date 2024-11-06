import { Request, Response, NextFunction } from "express"
import { Database } from '../../core/database.js'


export class BackupController {

    public static async backUpAllDatabases(req: Request, res: Response, next: NextFunction) {
        try {
            await Database.backupAll()
            res.status(200).send('Successfully backed up all databases.\n')
        } catch (error) {
            res.sendStatus(500)
            next(error)
        }
    }
}