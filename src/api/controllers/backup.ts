import { Request, Response, NextFunction } from "express"
import { Database } from '../../core/database.js'
import { Validators } from "../../core/validators.js"


export class BackupController {

    public static async backupDatabase(req: Request, res: Response, next: NextFunction): Promise<void> {
        
        const databaseName = req.params.databaseName
        if (!databaseName) {
            try {
                await Database.backupAll()
                res.status(200).send('Successfully backed up all databases.\n')
            } catch (error) {
                res.sendStatus(500)
                next(error)
            }
            
        } else {
            if (Validators.isDatabaseName(databaseName)) {
                try {
                    await Database.backup(databaseName)
                    res.status(200).send(`Successfully backed up database: ${databaseName}\n`)
                } catch (error) {
                    res.sendStatus(500)
                    next(error)
                }
                
            } else {
                res.sendStatus(500)
                next(`Was sent an invalid database name.`)
            }
        }
    }
}