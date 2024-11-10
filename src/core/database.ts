import { GmukkoLogger } from './gmukko_logger.js'
import { GmukkoTime } from './gmukko_time.js'
import { DatabaseNames, DatabaseTableNames, TestDatabaseNames } from '../configuration/db/index.js'
import { BackupDirectories } from '../configuration/directories/index.js'
import { Sequelize, QueryTypes } from 'sequelize'
import { promisify } from 'util'
import { exec } from 'child_process'
import { Media } from '../media/media.js'
import { MediaFactory } from '../media/media_factory.js'
import { Validators } from './validators.js'
import { ValidationResponse } from './file_engine.js'


export class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static stagingDatabase: Sequelize
    private static productionDatabase: Sequelize
    private static rejectDatabase: Sequelize


    public static async initialize(test: boolean): Promise<void> {
        if (test) {
            this.stagingDatabase = await this.loadDatabase(TestDatabaseNames.Staging)
            this.productionDatabase = await this.loadDatabase(TestDatabaseNames.Production)
            this.rejectDatabase = await this.loadDatabase(TestDatabaseNames.Rejected)
        } else {
            this.stagingDatabase = await this.loadDatabase(DatabaseNames.Staging)
            this.productionDatabase = await this.loadDatabase(DatabaseNames.Production)
            this.rejectDatabase = await this.loadDatabase(DatabaseNames.Rejected)
        }
    }

    public static async backupAll(): Promise<void> {
        for (const [, databaseName] of Object.values(DatabaseNames).entries()) {
            this.backup(databaseName)
        }
    }

    public static async backup(databaseName: DatabaseNames): Promise<void> {
        const execAsync = promisify(exec)
        try {
            await execAsync(`mysqldump -u ${this.username} -p${this.password} ${databaseName} > "./${BackupDirectories.Output}/${databaseName}___${GmukkoTime.getCurrentDateTime(true)}".sql`)
            GmukkoLogger.success(`Backed up database: ${databaseName}.`)
        } catch (error) {
            throw new Error(`Failed to back up database: ${databaseName}`, { cause: error })
        }
    }

    public static async removeMediaFromTable(databaseName: DatabaseNames, media: Media): Promise<number> {
        try {
            const count = await this.deleteFromTableWhereOneEqualsTwo(databaseName, media.getTableName(), `filePath`, media.filePath)
            return count
        } catch (error) {
            throw new Error(`Unable to remove ${media.filePath} from ${media.getTableName()}`, { cause: error })
        }
    }

    public static async indexFilesIntoStagingDatabase(media: Media[]): Promise<number> {
        try {
            const tableName = media[0].getTableName()
            const tableExistsInStaging = await this.tableExists(DatabaseNames.Staging, tableName)
            if (!tableExistsInStaging) {
               await this.initAndSyncModel(DatabaseNames.Staging, media[0])
            }
            
            if (media.length > 0) {
                for (const [, singleMedia] of media.entries()) {
                    await this.insertMediaIntoTable(DatabaseNames.Staging, singleMedia)
                }
            }

            return media.length
        } catch (error) {
            throw new Error(`Failed to add indexes to table: ${media[0].getTableName()}`, {cause: error})
        }
    }

    public static async moveStagingDatabaseEntriesToProduction(validationResponse: ValidationResponse, validationResponseWithUpdatedFilePaths: ValidationResponse): Promise<void> {
        await this.moveDatabaseOneEntriesToDatabaseTwo(validationResponse, validationResponseWithUpdatedFilePaths, DatabaseNames.Staging, DatabaseNames.Production)
    }

    public static async moveStagingDatabaseEntriesToRejected(validationResponse: ValidationResponse, validationResponseWithUpdatedFilePaths: ValidationResponse): Promise<void> {
        await this.moveDatabaseOneEntriesToDatabaseTwo(validationResponse, validationResponseWithUpdatedFilePaths, DatabaseNames.Staging, DatabaseNames.Rejected)
    }

    public static async getDatabaseEntriesFromTable(databaseName: DatabaseNames, tableName: DatabaseTableNames): Promise<Media[]> {
        const entries = await Database.selectAllFromTable(databaseName, tableName)
        if (Validators.isMediaArray(entries)) {
            return entries
        } else {
            throw new Error(`Pulled invalid media from database.`)
        }
    }

    private static async selectAllFromTable(databaseName: DatabaseNames, tableName: DatabaseTableNames): Promise <object[]> {
        const database = this.determineDatabase(databaseName)
        if (await this.tableExists(databaseName, tableName)) {
            const resultOfQuery = await database.query(
                `SELECT * FROM ${tableName};`,
                {   
                  type: QueryTypes.SELECT,
                }
            )
            
            return resultOfQuery
        }  else {
            return []
        }
    }

    private static async selectAllFromTableWhereColumnEqualsMatch(databaseName: DatabaseNames, tableName: DatabaseTableNames, column: string, match: string): Promise<object[]> {
        const database = this.determineDatabase(databaseName)
        if (await this.tableExists(databaseName, tableName)) {
            const resultOfQuery = await database.query(
                `SELECT * 
                FROM ${tableName}
                WHERE :column = :match;`,
                {
                    replacements: {
                        column: column,
                        match: match
                    },
                    type: QueryTypes.SELECT,
                }
            )
            return resultOfQuery
        } else {
            return []
        }
    }


    private static async deleteFromTableWhereOneEqualsTwo(databaseName: DatabaseNames, tableName: DatabaseTableNames, column: string, match: string): Promise<number> {
        const database = this.determineDatabase(databaseName)
         if (await this.tableExists(databaseName, tableName)) {
            const result = await database.query(
                `DELETE FROM ${tableName}
                WHERE ${column} = :match;`,
                {
                    type: QueryTypes.DELETE,
                    replacements: {
                        match: match
                    }
               }
            ) as unknown as [number, unknown]
            const count = result[0]
            try {
                return count   
            } catch (error) {
                throw new Error(`count is not of type number: ${count}`, { cause: error })
            }

        } else {
            return 0
        }
    }


    private static async insertMediaIntoTable(databaseName: DatabaseNames, media: Media, tableName?: DatabaseTableNames): Promise<void> {
        const database = this.determineDatabase(databaseName)
        try {
            const adjustedTableName = tableName ? tableName : media.getTableName() 
            const columns: string[] = ['createdAt', 'updatedAt']
            const values: string[] = [':createdAt', ':updatedAt']

            const replacements: any = {
                createdAt: new Date(), 
                updatedAt: new Date(),
            }

            for (const [, key] of Object.keys(media).entries()) {
                columns.push(key)
                values.push(`:${key}`)
                replacements[key] = media[key as keyof Media]
            }

            const query = `
                INSERT INTO ${adjustedTableName} (${columns.join(', ')})
                VALUES (${values.join(', ')});
            `

            await database.query(query, {
                replacements,
                type: QueryTypes.INSERT
            })

        } catch (error) {
            throw new Error(`Failed to index: ${media.filePath} in database: ${database.getDatabaseName()}`, { cause: error })
        }
    }


    public static async removeAlreadyIndexedFilePaths(databaseName: DatabaseNames, filePaths: string[]): Promise<string[]> {
        var filePathsToToss: string[] = []

        try {
            for (const [, filePath] of filePaths.entries()) {
                if (await this.filePathInDatabase(databaseName, filePath)) {
                    GmukkoLogger.data(`Tossing already indexed file`, filePath)
                    filePathsToToss.push(filePath)
                }
            }
            filePaths = filePaths.filter(filePath => !filePathsToToss.includes(filePath))
            if (filePathsToToss.length > 0) {
                GmukkoLogger.important(`${filePathsToToss.length} staging files were tossed due to already being indexed.`)
            }
            return filePaths
        } catch (error) {
            throw new Error("Error while removing already indexed media", { cause: error })
        }
    }


    private static async loadDatabase(databaseName: DatabaseNames | TestDatabaseNames): Promise<Sequelize> {
        try {
            if (this.username && this.password) {
                const sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)
                await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``, { logging: false })
                const database = new Sequelize(databaseName, this.username, this.password, {
                    host: 'localhost',
                    dialect: 'mysql',
                    logging: false,
                })
                return database
            } else {
                throw new Error(`Failed to load database because username and/or password were not defined.`)
            }
        } catch (error) {
            throw new Error(`Failed to load database: ${databaseName}`, { cause: error })
        }
    }

    private static async tableExists(databaseName: DatabaseNames, tableName: DatabaseTableNames): Promise<boolean> {
        const database = this.determineDatabase(databaseName)
        try {
            await database.query(
                `SELECT * FROM ${tableName};`,
                {
                  type: QueryTypes.SELECT,
                }
            )

            return true
        } catch (error) {
            return false
        }
    }


    private static async filePathInDatabase(databaseName: DatabaseNames, filePath: string): Promise<boolean> {
        const database = this.determineDatabase(databaseName)
        for (const [, tableName] of Object.values(DatabaseTableNames).entries()) {
            try {
                const tableExistsInStaging = await this.tableExists(databaseName, tableName)
                if (tableExistsInStaging) {
                    const resultOfQuery = await database.query(`
                        SELECT *
                        FROM ${tableName}
                        WHERE filePath = :filePath;
                        `,
                        {
                            replacements: {
                                filePath: filePath
                            }
                        })
                
                    if (resultOfQuery[0].length > 0) {
                        return true
                    }                    
                }
            } catch (error) {
                throw new Error(`Failed to verify if in ${tableName}: ${filePath}\n${error}`)
            }
        } 
        return false
    }
    

    private static async initAndSyncModel(databaseName: DatabaseNames, media: Media): Promise<void> {
        const database = this.determineDatabase(databaseName)
        try {
            const model = media.getModel()
            model.init(media.getAttributes(), { sequelize: database, tableName: media.getTableName() })
            await model.sync()
        } catch (error) {
            throw new Error(`Failed to init & sync model to table: ${media.getTableName()}`, { cause: error })
        }
    }

    private static determineDatabase(databaseName: DatabaseNames) {
        switch (databaseName) {
            case DatabaseNames.Staging:
                return this.stagingDatabase
            case DatabaseNames.Production:
                return this.productionDatabase
            case DatabaseNames.Rejected:
                return this.rejectDatabase
        }
    }

    private static async moveDatabaseOneEntriesToDatabaseTwo(originalValidationResponse: ValidationResponse, validationResponseWithUpdatedFilePaths: ValidationResponse, databaseOne: DatabaseNames, databaseTwo: DatabaseNames): Promise<void> {
        var count = 0

        try {
            for (const [, tableName] of Object.keys(validationResponseWithUpdatedFilePaths.tables).entries()) {
                for (const [i, media] of validationResponseWithUpdatedFilePaths.tables[tableName].entries()) {
                    const initialFilePath = originalValidationResponse.tables[tableName][i].filePath
                    if (initialFilePath !== media.filePath) {
                        const trueMedia = MediaFactory.createMediaFromTableName(media, tableName as DatabaseTableNames)
                        await this.initAndSyncModel(databaseTwo, trueMedia)
                        await this.insertMediaIntoTable(databaseTwo, trueMedia)
                        await this.deleteFromTableWhereOneEqualsTwo(databaseOne, tableName as DatabaseTableNames, `filepath`, initialFilePath)
                        count++
                    } else {
                        throw new Error(`filePath was not updated for ${databaseTwo}.\nDatabase indexes were not changed.`)
                    }
                }
            }
            GmukkoLogger.success(`${count} production index${count > 1 ? 'es' : ''} created and ${count} staging index${count > 1 ? 'es' : ''} removed.`)

        } catch (error) {
            throw new Error(`Error while moving staging database entry into production database. State unclear.`, { cause: error })
        }
    }
}