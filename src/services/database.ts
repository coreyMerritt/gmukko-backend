import { GmukkoLogger } from './gmukko_logger.js'
import { GmukkoTime } from './gmukko_time.js'
import { DatabaseTables, DatabaseNames } from '../interfaces_and_enums/index.js'
import { BackupPaths } from '../interfaces_and_enums/paths/index.js'
import { MovieDataModel, ShowDataModel, StandupDataModel, AnimeDataModel, AnimationDataModel, InternetDataModel, ModelAttributesAndOptions } from '../database_models/index.js'
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
            for (const [, databaseName] of Object.values(DatabaseNames).entries()) {
                await execAsync(`mysqldump -u ${this.username} -p${this.password} ${databaseName} > "./${BackupPaths.Output}/${databaseName}___${GmukkoTime.getCurrentDateTime(true)}".sql`)
            }
            return 200
        } catch (error) {
            return 500
        }
    }


    public static async indexMedia(media: Media[]) {
        GmukkoLogger.info(`Attempting to refresh the ${media[0].getTable()} table.`)
        try {
            const database = await this.createAndLoadDatabase(DatabaseNames.Staging)
            const tableExists = await this.tableExists(database, media[0].getTable())
            if (!tableExists) {
                await this.createTable(media[0].getTable(), database)
            }

            this.removeAlreadyIndexedMedia(media)
            
            for (const [, singleMedia] of media.entries()) {
                await this.insertMediaIntoTable(database, singleMedia)
            }
            GmukkoLogger.info(`Successfully refreshed the ${media[0].getTable()} table.`)
        } catch (error) {
            GmukkoLogger.info(`Failed to refresh the ${media[0].getTable()} table.`)
        }
    }


    private static async insertMediaIntoTable(database: Sequelize, media: Media) {
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
        } catch (error) {
            GmukkoLogger.error(`Unable to insert into ${media.getTable()}: ${JSON.stringify(media)}`)
        }
    }


    public static async removeAlreadyIndexedMedia(media: Media[]) {
        GmukkoLogger.info("Attempting to remove already indexed files from list of files to index.")
        var filePathsToToss: string[] = []
        try {
            for (const [i, singleMedia] of media.entries()) {
                for (const [, databaseName] of Object.values(DatabaseNames)) {
                    const database = await this.createAndLoadDatabase(databaseName as DatabaseNames)
                    if (!await this.filePathInTable(database, singleMedia)) {
                        GmukkoLogger.info(`Keeping file ${singleMedia.filePath} to index.`)
                    } else {
                        GmukkoLogger.info(`Tossing ${singleMedia.filePath} from list of files that need to be indexed.`)
                        media = media.filter(item => item.filePath !== singleMedia.filePath)
                    }
                }
            }
            GmukkoLogger.info(`Succesfully removed files already indexed in ${media[0].getTable()}.`)
            return media
        } catch (error) {
            GmukkoLogger.error(`Failed to remove files already indexed in ${media[0].getTable()}.`, error)
            return undefined
        }
    }


    private static async createAndLoadDatabase(databaseName: DatabaseNames): Promise<Sequelize> {
        GmukkoLogger.info(`Attempting to load to database.`)
        try {
            if (this.username && this.password) {
                const sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)
                await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``, { logging: false })
                const db = new Sequelize(databaseName, this.username, this.password, {
                    host: 'localhost',
                    dialect: 'mysql',
                    logging: false,
                })
                GmukkoLogger.info(`Successfully loaded database.`)
                return db
            } else {
                GmukkoLogger.error(`Failed to load database because username or password were not defined.`)
                process.exit(1)
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to load database.`, error)
            process.exit(1)
        }
    }


    private static async createTable(table: DatabaseTables, db: Sequelize) {
        GmukkoLogger.info(`Attempting to create ${table}.`)
        const VideoModel = this.determineModelByTable(table)
         if (VideoModel) {
            await this.initAndSyncVideoModel(VideoModel, table, db)
        }
    }


    private static async tableExists(db: Sequelize, table: string) {
        GmukkoLogger.info(`Checking if ${table} exists.`)
        try {
            const result = await db.query(
                `SELECT * FROM ${table}`,
                {
                  type: QueryTypes.SELECT,
                }
            )
            GmukkoLogger.info(`${table} does exist.`)
            return true
        } catch (error) {
            GmukkoLogger.info(`${table} does not exist.`)
            return false
        }
    }


    public static async filePathInTable(db: Sequelize, media: Media) {
        try {
            const result = await db.query(`
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


    private static determineModelByTable(table: DatabaseTables) {
        switch (table) {
            case DatabaseTables.Movies:
                return MovieDataModel
            case DatabaseTables.Shows:
                return ShowDataModel
            case DatabaseTables.Standup:
                return StandupDataModel
            case DatabaseTables.Anime:
                return AnimeDataModel
            case DatabaseTables.Animation:
                return AnimationDataModel
            default:
                return InternetDataModel
        }
    }
    

    private static async initAndSyncVideoModel(VideoModel: any, table: DatabaseTables, db: Sequelize) {
        try {
            await VideoModel.init(ModelAttributesAndOptions.getAttributes(table), ModelAttributesAndOptions.getOptions(db, table))
            await VideoModel.sync()
            GmukkoLogger.info(`Successfully created ${table} table.`)
        } catch (error) {
            GmukkoLogger.error(`Failed to create ${table} table.`, error)
        }
    }
}