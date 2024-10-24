import { GmukkoLogger, GmukkoTime, VideoFiles, Validators } from './index.js'
import { AnimationData, AnimeData, DatabaseTables, InternetData, VideoData, VideoDataTypes, MovieData, StandupData, ShowData, DatabaseNames 
} from '../interfaces_and_enums/index.js'
import { BackupPaths } from '../interfaces_and_enums/paths/index.js'
import { MovieDataModel, ShowDataModel, StandupDataModel, AnimeDataModel, AnimationDataModel, InternetDataModel, ModelAttributesAndOptions } from '../database_models/index.js'
import { DataTypes, Sequelize, QueryTypes } from 'sequelize'
import { promisify } from 'util'
import { exec } from 'child_process'


export class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)


    public static async backup(): Promise<number> {
        const execAsync = promisify(exec)
        try {
            for (const databaseName in DatabaseNames) {
                await execAsync(`mysqldump -u ${this.username} -p${this.password} ${databaseName} > "./${BackupPaths.Output}/${databaseName}___${GmukkoTime.getCurrentDateTime(true)}".sql`)
            }
            return 200
        } catch (error) {
            return 500
        }
    }


    public static async refreshTable(databaseName: DatabaseNames, table: DatabaseTables, directoryToIndex: string, validFileTypes: string[]) {
        GmukkoLogger.info(`Attempting to refresh the ${table} table.`)
        try {
            const dataBase = await this.createAndLoadDatabase(databaseName)
            const tableExists = await this.tableExists(dataBase, table)
            if (!tableExists) {
                await this.createTable(table, dataBase)
            }

            const videoFiles = await VideoFiles.getDataToIndex(directoryToIndex, validFileTypes, dataBase, table)
            if (videoFiles) {
                await this.indexVideoData(videoFiles, dataBase, table)
                GmukkoLogger.info(`Successfully refreshed the ${table} table.`)
            }
        } catch (error) {
            GmukkoLogger.info(`Failed to refresh the ${table} table.`)
        }
    }


    private static async createAndLoadDatabase(database: string): Promise<Sequelize> {
        GmukkoLogger.info(`Attempting to load to database.`)
        try {
            const creationResult = await this.sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
            if (this.username && this.password) {
                const db = new Sequelize(database, this.username, this.password, {
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
                `SELECT * FROM ${table};`,
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


    private static async indexVideoData(videoFiles: VideoData[], db: Sequelize, table: DatabaseTables) {
        GmukkoLogger.info("Attempting to index files.")
        for (const [i, videoFile] of videoFiles.entries()) {
            if (!this.filePathInTable(videoFile.filePath, db, table)) {
                GmukkoLogger.info(`Indexing File #${i}: ${JSON.stringify(videoFile)}`)
                switch (table) {
                    case (DatabaseTables.Movies):
                        if (Validators.isMovieData(videoFile)) {
                            await this.insertMovieDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Movies)
                        }
                        break
                    case (DatabaseTables.Shows):
                        if (Validators.isShowData(videoFile)) {
                            await this.insertShowDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Shows)
                        }
                        break
                    case (DatabaseTables.Standup):
                        if (Validators.isStandupData(videoFile)) {
                            await this.insertStandupDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Standup)
                        }
                        break
                    case (DatabaseTables.Anime):
                        if (Validators.isAnimeData(videoFile)) {
                            await this.insertAnimeDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Anime)
                        }
                        break
                    case (DatabaseTables.Animation):
                        if (Validators.isAnimationData(videoFile)) {
                            await this.insertAnimationDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Animation)
                        }
                        break
                    case (DatabaseTables.Internet):
                        if (Validators.isInternetData(videoFile)) {
                            await this.insertInternetDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Internet)
                        }
                        break
                    default:
                        if (Validators.isMovieData(videoFile)) {
                            GmukkoLogger.error(`Data is valid video data, but is not structured for the ${table} table.`)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile)
                        }
                }
            } else {
                GmukkoLogger.info(`File #${i}: ${videoFile.filePath} is already indexed.`)
            }
        }
    }


    public static async filePathInTable(filePath: string, db: Sequelize, table: DatabaseTables) {
        try {
            const result = await db.query(`
                SELECT *
                FROM ${table};
            `)
            if (result.length > 0) {
                return true
            } else {
                return false
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to query table: ${table}`, error)
        }
    }


    private static async insertMovieDataIntoTable(movieData: MovieData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Movies} (filePath, title, releaseYear, createdAt, updatedAt)
                VALUES (:filePath, :title, :releaseYear, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: movieData.filePath,
                    title: movieData.title,
                    releaseYear: movieData.releaseYear,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${movieData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${movieData.filePath}`, error)
        }
    }

    private static async insertShowDataIntoTable(showData: ShowData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Shows} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: showData.filePath,
                    title: showData.title,
                    seasonNumber: showData.seasonNumber,
                    episodeNumber: showData.episodeNumber,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${showData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${showData.filePath}`, error)
        }
    }

    private static async insertStandupDataIntoTable(standupData: StandupData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Standup} (filePath, title, artist, releaseYear, createdAt, updatedAt)
                VALUES (:filePath, :title, :artist, :releaseYear, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: standupData.filePath,
                    title: standupData.title,
                    artist: standupData.artist,
                    releaseYear: standupData.releaseYear,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${standupData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${standupData.filePath}`, error)
        }
    }

    private static async insertAnimeDataIntoTable(animeData: AnimeData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Anime} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: animeData.filePath,
                    title: animeData.title,
                    seasonNumber: animeData.seasonNumber,
                    episodeNumber: animeData.episodeNumber, 
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${animeData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${animeData.filePath}`, error)
        }
    }

    private static async insertAnimationDataIntoTable(animationData: AnimationData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Animation} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: animationData.filePath,
                    title: animationData.title,
                    seasonNumber: animationData.seasonNumber,
                    episodeNumber: animationData.episodeNumber, 
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${animationData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${animationData.filePath}`, error)
        }
    }

    private static async insertInternetDataIntoTable(internetData: InternetData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Internet} (filePath, title, createdAt, updatedAt)
                VALUES (:filePath, :title, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: internetData.filePath,
                    title: internetData.title,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${internetData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${internetData.filePath}`, error)
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
            case DatabaseTables.Internet:
                return InternetDataModel
            default:
                return undefined
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