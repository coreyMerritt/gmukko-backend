import { GmukkoLogger } from './gmukko_logger.js'
import { GmukkoTime } from './gmukko_time.js'
import { DatabaseNames } from '../configuration/index.js'
import { BackupDirectories } from '../configuration/index.js'
import { ModelAttributesAndOptions } from '../database_models/index.js'
import { Sequelize, QueryTypes } from 'sequelize'
import { promisify } from 'util'
import { exec } from 'child_process'
import { Media } from '../media/media.js'


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
        const table = media[0].getTable()
        GmukkoLogger.info(`Attempting to refresh the ${table} table.`)
        try {
            const stagingDatabase = await this.createAndLoadDatabase(DatabaseNames.Staging)
            const tableExistsInStaging = await this.tableExists(stagingDatabase, media[0].getTable())
            if (tableExistsInStaging) {
                media = await this.removeAlreadyIndexedMedia(stagingDatabase, media)
            } else {
                await this.createTable(stagingDatabase, media[0])
            }

            if (media.length > 0) {
                const productionDatabase = await this.createAndLoadDatabase(DatabaseNames.Production)
                const tableExistsInProduction = await this.tableExists(productionDatabase, media[0].getTable())
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
                INSERT INTO ${media.getTable()} (${columns.join(', ')})
                VALUES (${values.join(', ')})
            `

            const result = await database.query(query, {
                replacements,
                type: QueryTypes.INSERT
            })
            GmukkoLogger.info(`Successfully indexed: ${media.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${media.filePath}`)
        }
    }


    public static async removeAlreadyIndexedMedia(database: Sequelize, media: Media[]) {
        GmukkoLogger.info("Attempting to remove already indexed files from list of files to index.")
        let filePathsToToss: string[] = []
    
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
        GmukkoLogger.info(`Attempting to create ${media.getTable()}.`)
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


    public static async filePathInTable(database: Sequelize, media: Media) {
        try {
            const result = await database.query(`
                SELECT *
                FROM ${media.getTable()}
            `)
            if (result.length > 0) {
                return true
            } else {
                return false
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to query table: ${media.getTable()}`, error)
        }
    }
    

    private static async initAndSyncModel(database: Sequelize, media: Media) {
        try {
            const model = await media.getModel()
            model.init(ModelAttributesAndOptions.getAttributes(media.getTable()), ModelAttributesAndOptions.getOptions(database, media.getTable()))
            await model.sync()
            GmukkoLogger.info(`Successfully created ${media.getTable()} table.`)
        } catch (error) {
            GmukkoLogger.error(`Failed to create ${media.getTable()} table.`, error)
        }
    }
}