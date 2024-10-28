import { GmukkoLogger } from './gmukko_logger.js'
import { GmukkoTime } from './gmukko_time.js'
import { DatabaseNames, DatabaseTableNames } from '../configuration/index.js'
import { BackupDirectories } from '../configuration/index.js'
import { Sequelize, QueryTypes, col } from 'sequelize'
import { promisify } from 'util'
import { exec } from 'child_process'
import { Media } from '../media/media.js'
import { ValidationRequest } from '../controllers/media_controller.js'
import { table } from 'console'
import { MediaFactory } from '../media/media_factory.js'


export class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'


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


    public static async indexFilesIntoStagingDatabase(media: Media[]) {
        try {
            const tableName = media[0].getTableName()
            const stagingDatabase = await this.createAndLoadDatabase(DatabaseNames.Staging)
            const tableExistsInStaging = await this.tableExists(stagingDatabase, tableName)
            if (!tableExistsInStaging) {
               await this.initAndSyncModel(stagingDatabase, media[0])
            }
            
            if (media.length > 0) {
                for (const [, singleMedia] of media.entries()) {
                    await this.insertMediaIntoTable(stagingDatabase, singleMedia)
                }
            }

            return media.length
        } catch (error) {
            throw new Error(`Failed to add indexes to table: ${media[0].getTableName()}`, {cause: error})
        }
    }


    public static async moveStagingDatabaseEntriesToProduction(originalRequest: ValidationRequest, updatedRequest: ValidationRequest): Promise<void> {
        var count = 0
        try {
            const productionDatabase = await this.createAndLoadDatabase(DatabaseNames.Production)
            const stagingDatabase = await this.createAndLoadDatabase(DatabaseNames.Staging)
            for (const [, tableName] of Object.keys(updatedRequest.tables).entries()) {
                for (const [i, media] of updatedRequest.tables[tableName].entries()) {
                    const stagingFilePath = originalRequest.tables[tableName][i].filePath
                    if (stagingFilePath !== media.filePath) {
                        const trueMedia = MediaFactory.createMediaFromTableName(media, tableName as DatabaseTableNames)
                        await this.initAndSyncModel(productionDatabase, trueMedia)
                        await this.insertMediaIntoTable(productionDatabase, trueMedia)
                        await this.deleteFromTableWhereOneEqualsTwo(stagingDatabase, tableName as DatabaseTableNames, `filepath`, stagingFilePath)
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

    public static async getStagingDatabaseEntriesFromTable(tableName: DatabaseTableNames) {
        const entries = await Database.selectAllFromTable(DatabaseNames.Staging, tableName)
        return entries
    }

    private static async selectAllFromTable(databaseName: DatabaseNames, tableName: DatabaseTableNames) {
        const database = await this.createAndLoadDatabase(databaseName)
        if (await this.tableExists(database, tableName)) {
            const resultOfQuery = await database.query(
                `SELECT * FROM ${tableName};`,
                {
                  type: QueryTypes.SELECT,
                }
            )
            
            return resultOfQuery
        }
    }

    private static async selectAllFromTableWhereColumnEqualsMatch(databaseName: DatabaseNames, tableName: DatabaseTableNames, column: string, match: string) {
        const database = await this.createAndLoadDatabase(databaseName)
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
        }
    }


    private static async deleteFromTableWhereOneEqualsTwo(database: Sequelize, tableName: DatabaseTableNames, column: string, match: string) {
        if (await this.tableExists(database, tableName)) {
            const resultOfQuery = await database.query(
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


    private static async insertMediaIntoTable(database: Sequelize, media: Media, tableName?: DatabaseTableNames) {
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


    public static async removeAlreadyIndexedFilePaths(databaseName: DatabaseNames, filePaths: string[]) {
        var filePathsToToss: string[] = []
        const database = await this.createAndLoadDatabase(databaseName)
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


    private static async createAndLoadDatabase(databaseName: DatabaseNames): Promise<Sequelize> {
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

    private static async tableExists(database: Sequelize, tableName: DatabaseTableNames) {
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
    

    private static async initAndSyncModel(database: Sequelize, media: Media) {
        try {
            const model = media.getModel()
            model.init(media.getAttributes(), { sequelize: database, tableName: media.getTableName() })
            await model.sync()
        } catch (error) {
            throw new Error(`Failed to init & sync model to table: ${media.getTableName()}`, { cause: error })
        }
    }
}