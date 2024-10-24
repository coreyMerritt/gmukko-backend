import { GmukkoLogger, GmukkoTime, VideoFiles, Validators } from './index.js'
import { AnimationFileData, AnimeFileData, DatabaseTables, InternetFileData, VideoData, VideoDataTypes, MovieFileData, StandupFileData, ShowFileData, DatabaseNames 
} from '../interfaces_and_enums/index.js'
import { BackupPaths } from '../interfaces_and_enums/paths/index.js'
import { MovieFileDataModel, ShowFileDataModel, StandupFileDataModel, AnimeFileDataModel, AnimationFileDataModel, InternetFileDataModel } from '../database_models/index.js'
import { DataTypes, Sequelize, QueryTypes } from 'sequelize'
import { promisify } from 'util'
import { exec } from 'child_process'


export class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)


    public static async backupDatabase(): Promise<number> {
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

            const videoFiles = await VideoFiles.getFileDataToIndex(directoryToIndex, validFileTypes, dataBase, table)
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
                        if (Validators.isMovieFileData(videoFile)) {
                            await this.insertStagingMovieFileDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Movies)
                        }
                        break
                    case (DatabaseTables.Shows):
                        if (Validators.isShowFileData(videoFile)) {
                            await this.insertStagingShowFileDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Shows)
                        }
                        break
                    case (DatabaseTables.Standup):
                        if (Validators.isStandupFileData(videoFile)) {
                            await this.insertStagingStandupFileDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Standup)
                        }
                        break
                    case (DatabaseTables.Anime):
                        if (Validators.isAnimeFileData(videoFile)) {
                            await this.insertStagingAnimeFileDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Anime)
                        }
                        break
                    case (DatabaseTables.Animation):
                        if (Validators.isAnimationFileData(videoFile)) {
                            await this.insertStagingAnimationFileDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Animation)
                        }
                        break
                    case (DatabaseTables.Internet):
                        if (Validators.isInternetFileData(videoFile)) {
                            await this.insertStagingInternetFileDataIntoTable(videoFile, db)
                        } else {
                            GmukkoLogger.invalidVideoData(videoFile, VideoDataTypes.Internet)
                        }
                        break
                    default:
                        if (Validators.isMovieFileData(videoFile)) {
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


    private static async insertStagingMovieFileDataIntoTable(movieFileData: MovieFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Movies} (filePath, title, releaseYear, createdAt, updatedAt)
                VALUES (:filePath, :title, :releaseYear, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: movieFileData.filePath,
                    title: movieFileData.title,
                    releaseYear: movieFileData.releaseYear,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${movieFileData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${movieFileData.filePath}`, error)
        }
    }

    private static async insertStagingShowFileDataIntoTable(showFileData: ShowFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Shows} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: showFileData.filePath,
                    title: showFileData.title,
                    seasonNumber: showFileData.seasonNumber,
                    episodeNumber: showFileData.episodeNumber,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${showFileData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${showFileData.filePath}`, error)
        }
    }

    private static async insertStagingStandupFileDataIntoTable(standupFileData: StandupFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Standup} (filePath, title, artist, releaseYear, createdAt, updatedAt)
                VALUES (:filePath, :title, :artist, :releaseYear, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: standupFileData.filePath,
                    title: standupFileData.title,
                    artist: standupFileData.artist,
                    releaseYear: standupFileData.releaseYear,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${standupFileData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${standupFileData.filePath}`, error)
        }
    }

    private static async insertStagingAnimeFileDataIntoTable(animeFileData: AnimeFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Anime} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: animeFileData.filePath,
                    title: animeFileData.title,
                    seasonNumber: animeFileData.seasonNumber,
                    episodeNumber: animeFileData.episodeNumber, 
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${animeFileData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${animeFileData.filePath}`, error)
        }
    }

    private static async insertStagingAnimationFileDataIntoTable(animationFileData: AnimationFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Animation} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: animationFileData.filePath,
                    title: animationFileData.title,
                    seasonNumber: animationFileData.seasonNumber,
                    episodeNumber: animationFileData.episodeNumber, 
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${animationFileData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${animationFileData.filePath}`, error)
        }
    }

    private static async insertStagingInternetFileDataIntoTable(internetFileData: InternetFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Internet} (filePath, title, createdAt, updatedAt)
                VALUES (:filePath, :title, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: internetFileData.filePath,
                    title: internetFileData.title,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
            GmukkoLogger.info(`Successfully indexed: ${internetFileData.filePath}`)
        } catch (error) {
            GmukkoLogger.error(`Failed to index: ${internetFileData.filePath}`, error)
        }
    }


    private static determineModelByTable(table: DatabaseTables) {
        switch (table) {
            case DatabaseTables.Movies:
                return MovieFileDataModel
            case DatabaseTables.Shows:
                return ShowFileDataModel
            case DatabaseTables.Standup:
                return StandupFileDataModel
            case DatabaseTables.Anime:
                return AnimeFileDataModel
            case DatabaseTables.Animation:
                return AnimationFileDataModel
            case DatabaseTables.Internet:
                return InternetFileDataModel
            default:
                return undefined
        }
    }
    

    private static async initAndSyncVideoModel(VideoModel: any, table: DatabaseTables, db: Sequelize) {
        try {
            switch (table) {
                case DatabaseTables.Movies:
                    await VideoModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allowNull: false, unique: true},
                            title: {type: DataTypes.STRING, allowNull: false},
                            releaseYear: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Shows:
                    await VideoModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Standup:
                    await VideoModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            artist: {type: DataTypes.STRING, allownull: true},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Anime:
                    await VideoModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Animation:
                    await VideoModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Internet:
                    await VideoModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
            }

            await VideoModel.sync()
            GmukkoLogger.info(`Successfully created ${table} table.`)
        } catch (error) {
            GmukkoLogger.error(`Failed to create ${table} table.`, error)
        }
    }
}