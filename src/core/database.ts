import { GmukkoLogger } from './gmukko_logger.js'
import { GmukkoTime } from './gmukko_time.js'
import { DatabaseNames, DatabaseTableNames } from '../configuration/index.js'
import { BackupDirectories } from '../configuration/index.js'
import { Sequelize, QueryTypes, col } from 'sequelize'
import { promisify } from 'util'
import { exec } from 'child_process'
import { Media } from '../media/media.js'
import { ValidationRequest } from '../controllers/media_controller.js'


export class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'


    public static async backup(): Promise<number> {
        const execAsync = promisify(exec)
        try {
            for (const [, databaseName] of [DatabaseNames.Production, DatabaseNames.Staging]) {
                await execAsync(`mysqldump -u ${this.username} -p${this.password} ${databaseName} > "./${BackupDirectories.Output}/${databaseName}___${GmukkoTime.getCurrentDateTime(true)}".sql`)
            }
            return 200
        } catch (error) {
            return 500
        }
    }


    public static async indexMedia(media: Media[]) {
        const table = media[0].getTableName()
        GmukkoLogger.info(`Attempting to refresh the ${table} table.`)
        try {
            const stagingDatabase = await this.createAndLoadDatabase(DatabaseNames.Staging)
            const tableExistsInStaging = await this.tableExists(stagingDatabase, media[0].getTableName())
            if (tableExistsInStaging) {
                media = await this.removeAlreadyIndexedMedia(stagingDatabase, media)
            } else {
                await this.createTable(stagingDatabase, media[0])
            }

            if (media.length > 0) {
                const productionDatabase = await this.createAndLoadDatabase(DatabaseNames.Production)
                const tableExistsInProduction = await this.tableExists(productionDatabase, media[0].getTableName())
                if (tableExistsInProduction) {
                    media = await this.removeAlreadyIndexedMedia(stagingDatabase, media)
                }
            }
            
            if (media.length > 0) {
                for (const [, singleMedia] of media.entries()) {
                    await this.insertMediaIntoTable(stagingDatabase, singleMedia)
                }
            }
            GmukkoLogger.info(`Successfully refreshed the ${table} table.`)
        } catch (error) {
            GmukkoLogger.info(`Failed to refresh the ${table} table.`)
        }
    }


    public static async moveStagingDatabaseEntriesToProduction(validationRequest: ValidationRequest): Promise<void> {
        const productionDatabase = await this.createAndLoadDatabase(DatabaseNames.Production)
        for (const [, tableName] of Object.keys(validationRequest.tables).entries()) {
            for (const [, media] of validationRequest.tables[tableName].entries()) {
                await this.insertMediaIntoTable(productionDatabase, media)
            }
        }
    }


    public static async selectAllFromTable(databaseName: DatabaseNames, tableName: DatabaseTableNames) {
        const database = await this.createAndLoadDatabase(databaseName)
        if (await this.tableExists(database, tableName)) {
            const resultOfQuery = await database.query(
                `SELECT * FROM ${tableName}`,
                {
                  type: QueryTypes.SELECT,
                }
            )
            return resultOfQuery
        }
    }


    public static async selectAllFromTableWhereColumnEqualsMatch(databaseName: DatabaseNames, tableName: DatabaseTableNames, column: string, match: string) {
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


    private static async deleteFromTableWhereOneEqualsTwo(databaseName: DatabaseNames, tableName: DatabaseTableNames, column: string, match: string) {
        const database = await this.createAndLoadDatabase(databaseName)
        if (await this.tableExists(database, tableName)) {
            const resultOfQuery = await database.query(
                `DELETE FROM ${tableName}
                WHERE :column = :match;`,
                {
                    type: QueryTypes.DELETE,
                    replacements: {
                        column: column,
                        match: match
                    }
                }
            )
        }
    }


    private static async insertMediaIntoTable(database: Sequelize, media: Media) {
        GmukkoLogger.info(`Attempting to index: ${media.filePath}`)
        try {
            const columns: string[] = ['filePath', 'title', 'createdAt', 'updatedAt']
            const values: string[] = [':filePath', ':title', ':createdAt', ':updatedAt']
            const replacements: any = {
                filePath: media.filePath,
                title: media.title,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            if ('releaseYear' in media) {
                columns.push('releaseYear')
                values.push(':releaseYear')
                replacements.releaseYear = (media as any).releaseYear
            }
            if ('artist' in media) {
                columns.push('artist')
                values.push(':artist')
                replacements.artist = (media as any).artist
            }
            if ('seasonNumber' in media) {
                columns.push('seasonNumber')
                values.push(':seasonNumber')
                replacements.seasonNumber = (media as any).seasonNumber
            }
            if ('episodeNumber' in media) {
                columns.push('episodeNumber')
                values.push(':episodeNumber')
                replacements.episodeNumber = (media as any).episodeNumber
            }

            const query = `
                INSERT INTO ${media.getTableName()} (${columns.join(', ')})
                VALUES (${values.join(', ')})
            `

            await database.query(query, {
                replacements,
                type: QueryTypes.INSERT
            })
            GmukkoLogger.info(`Successfully indexed: ${media.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${media.filePath}`)
        }
    }


    private static async removeAlreadyIndexedMedia(database: Sequelize, media: Media[]) {
        GmukkoLogger.info("Attempting to remove already indexed files from list of files to index.")
        var filePathsToToss: string[] = []
    
        try {
            for (const singleMedia of media) {
                if (!await this.filePathInTable(database, singleMedia)) {
                    GmukkoLogger.info(`Keeping unindexed file: ${singleMedia.filePath}.`)
                } else {
                    GmukkoLogger.info(`Tossing already indexed file: ${singleMedia.filePath}.`)
                    filePathsToToss.push(singleMedia.filePath)
                }
            }
            media = media.filter(item => !filePathsToToss.includes(item.filePath))
        } catch (error) {
            GmukkoLogger.error("Error while removing already indexed media", error)
        }
        return media
    }


    private static async createAndLoadDatabase(databaseName: DatabaseNames): Promise<Sequelize> {
        GmukkoLogger.info(`Attempting to load to database.`)
        try {
            if (this.username && this.password) {
                const sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)
                await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``, { logging: false })
                const database = new Sequelize(databaseName, this.username, this.password, {
                    host: 'localhost',
                    dialect: 'mysql',
                    logging: false,
                })
                GmukkoLogger.info(`Successfully loaded database.`)
                return database
            } else {
                GmukkoLogger.error(`Failed to load database because username or password were not defined.`)
                process.exit(1)
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to load database.`, error)
            process.exit(1)
        }
    }


    private static async createTable(database: Sequelize, media: Media) {
        GmukkoLogger.info(`Attempting to create ${media.getTableName()}.`)
        await this.initAndSyncModel(database, media)
    }


    private static async tableExists(database: Sequelize, table: string) {
        try {
            const result = await database.query(
                `SELECT * FROM ${table}`,
                {
                  type: QueryTypes.SELECT,
                }
            )
            return true
        } catch (error) {
            return false
        }
    }


    private static async filePathInTable(database: Sequelize, media: Media) {
        try {
            const result = await database.query(`
                SELECT *
                FROM ${media.getTableName()};
            `)
            if (result.length > 0) {
                return true
            } else {
                return false
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to query table: ${media.getTableName()}`, error)
        }
    }
    

    private static async initAndSyncModel(database: Sequelize, media: Media) {
        try {
            const model = media.getModel()
            model.init(media.getAttributes(), media.getOptions(database, media.getTableName()))
            await model.sync()
            GmukkoLogger.info(`Successfully created ${media.getTableName()} table.`)
        } catch (error) {
            GmukkoLogger.error(`Failed to create ${media.getTableName()} table.`, error)
        }
    }
}