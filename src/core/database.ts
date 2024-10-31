import { GmukkoLogger } from './gmukko_logger.js'
import { GmukkoTime } from './gmukko_time.js'
import { DatabaseNames, DatabaseTableNames } from '../configuration/index.js'
import { BackupDirectories } from '../configuration/index.js'
import { Sequelize, QueryTypes } from 'sequelize'
import { promisify } from 'util'
import { exec } from 'child_process'
import { Media } from '../media/media.js'
import { ValidationResponse } from '../controllers/media_controller.js'
import { MediaFactory } from '../media/media_factory.js'
import { Validators } from './validators.js'


export class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static stagingDatabase: Sequelize
    private static productionDatabase: Sequelize


    public static async initialize(): Promise<void> {
        this.stagingDatabase = await this.loadDatabase(DatabaseNames.Staging)
        this.productionDatabase = await this.loadDatabase(DatabaseNames.Production)
    }

    public static async backupAll(): Promise<void> {
        const execAsync = promisify(exec)
        try {
            for (const [, databaseName] of Object.values(DatabaseNames).entries()) {
                await execAsync(`mysqldump -u ${this.username} -p${this.password} ${databaseName} > "./${BackupDirectories.Output}/${databaseName}___${GmukkoTime.getCurrentDateTime(true)}".sql`)
            }
            GmukkoLogger.success(`Backed up both databases.`)
        } catch (error) {
            throw new Error(`Failed to back up databases.`, { cause: error })
        }
    }


    public static async indexFilesIntoStagingDatabase(media: Media[]): Promise<number> {
        try {
            const tableName = media[0].getTableName()
            const tableExistsInStaging = await this.tableExists(this.stagingDatabase, tableName)
            if (!tableExistsInStaging) {
               await this.initAndSyncModel(this.stagingDatabase, media[0])
            }
            
            if (media.length > 0) {
                for (const [, singleMedia] of media.entries()) {
                    await this.insertMediaIntoTable(this.stagingDatabase, singleMedia)
                }
            }

            return media.length
        } catch (error) {
            throw new Error(`Failed to add indexes to table: ${media[0].getTableName()}`, {cause: error})
        }
    }


    public static async moveStagingDatabaseEntriesToProduction(originalValidationReponse: ValidationResponse, validationReponseWithUpdatedFilePaths: ValidationResponse): Promise<void> {
        var count = 0

        try {
            for (const [, tableName] of Object.keys(validationReponseWithUpdatedFilePaths.tables).entries()) {
                for (const [i, media] of validationReponseWithUpdatedFilePaths.tables[tableName].entries()) {
                    const stagingFilePath = originalValidationReponse.tables[tableName][i].filePath
                    if (stagingFilePath !== media.filePath) {
                        const trueMedia = MediaFactory.createMediaFromTableName(media, tableName as DatabaseTableNames)
                        await this.initAndSyncModel(this.productionDatabase, trueMedia)
                        await this.insertMediaIntoTable(this.productionDatabase, trueMedia)
                        await this.deleteFromTableWhereOneEqualsTwo(this.stagingDatabase, tableName as DatabaseTableNames, `filepath`, stagingFilePath)
                        count++
                    } else {
                        throw new Error(`filePath was not updated for production.\nDatabase indexes were not changed.`)
                    }
                }
            }
            GmukkoLogger.success(`${count} production index${count > 1 ? 'es' : undefined} created and ${count} staging index${count > 1 ? 'es' : undefined} removed.`)

        } catch (error) {
            throw new Error(`Error while moving staging database entry into production database. State unclear.`, { cause: error })
        }
    }

    public static async getStagingDatabaseEntriesFromTable(tableName: DatabaseTableNames): Promise<Media[]> {
        const entries = await Database.selectAllFromTable(DatabaseNames.Staging, tableName)
        if (Validators.isMediaArray(entries)) {
            return entries
        } else {
            throw new Error(`Pulled invalid media from database.`)
        }
    }

    private static async selectAllFromTable(databaseName: DatabaseNames, tableName: DatabaseTableNames): Promise <object[]> {
        const database = databaseName === DatabaseNames.Staging ? this.stagingDatabase : this.productionDatabase
        if (await this.tableExists(database, tableName)) {
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
        const database = databaseName === DatabaseNames.Staging ? this.stagingDatabase : this.productionDatabase
        if (await this.tableExists(database, tableName)) {
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


    private static async deleteFromTableWhereOneEqualsTwo(database: Sequelize, tableName: DatabaseTableNames, column: string, match: string): Promise<void> {
        if (await this.tableExists(database, tableName)) {
            await database.query(
                `DELETE FROM ${tableName}
                WHERE ${column} = :match;`,
                {
                    type: QueryTypes.DELETE,
                    replacements: {
                        match: match
                    }
                }
            )
        }
    }


    private static async insertMediaIntoTable(database: Sequelize, media: Media, tableName?: DatabaseTableNames): Promise<void> {
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
        const database = databaseName === DatabaseNames.Staging ? this.stagingDatabase : this.productionDatabase
        try {
            for (const [, filePath] of filePaths.entries()) {
                if (await this.filePathInDatabase(database, filePath)) {
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


    private static async loadDatabase(databaseName: DatabaseNames): Promise<Sequelize> {
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

    private static async tableExists(database: Sequelize, tableName: DatabaseTableNames): Promise<boolean> {
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


    private static async filePathInDatabase(database: Sequelize, filePath: string): Promise<boolean> {
        for (const [, tableName] of Object.values(DatabaseTableNames).entries()) {
            try {
                const tableExistsInStaging = await this.tableExists(database, tableName)
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
    

    private static async initAndSyncModel(database: Sequelize, media: Media): Promise<void> {
        try {
            const model = media.getModel()
            model.init(media.getAttributes(), { sequelize: database, tableName: media.getTableName() })
            await model.sync()
        } catch (error) {
            throw new Error(`Failed to init & sync model to table: ${media.getTableName()}`, { cause: error })
        }
    }
}