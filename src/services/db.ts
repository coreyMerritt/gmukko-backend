import { DataTypes, Sequelize, QueryTypes } from 'sequelize'
import { MovieFileDataModel, ShowFileDataModel, StandupFileDataModel, AnimeFileDataModel, AnimationFileDataModel, InternetFileDataModel, MediaDataFileModel } from '../database_models/media_file_data_models.js'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import MediaFiles from './media_files.js'
import { AnimationFileData, AnimeFileData, InternetFileData, MediaFileData, MediaFileDataTypes, MovieFileData, ShowFileData, StandupFileData } from '../interfaces_and_enums/video_file_data_types.js'
import GmukkoLogger from './gmukko_logger.js'
import Validators from './validators.js'
import { BackupPaths } from '../interfaces_and_enums/backup_directories.js'
import { promisify } from 'util'
import { exec } from 'child_process'
import GmukkoTime from './gmukko_time.js'


export default class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static databaseName = 'gmukko-backend'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)


    public static async backupDatabase() {
        const execAsync = promisify(exec)
        try {
            await execAsync(`mysqldump -u ${this.username} -p${this.password} ${this.databaseName} > "./${BackupPaths.DefaultDirectory}/${this.databaseName} - ${GmukkoTime.getCurrentDateTime(true)}".sql`)
            return 200
        } catch (error) {
            return 500
        }
    }


    public static async refreshTable(table: DatabaseTables, directoryToIndex: string, validFileTypes: string[]) {
        GmukkoLogger.info(`Attempting to refresh the ${table} table.`)
        try {
            const db = await this.createAndLoadDatabase(this.databaseName)
            const tableExists = await this.tableExists(db, table)
            if (!tableExists) {
                await this.createTable(table, db)
            }
            const mediaFiles = await MediaFiles.getFileDataToIndex(directoryToIndex, validFileTypes, db, table)
            await this.indexMediaFileData(mediaFiles, db, table)
            GmukkoLogger.info(`Successfully refreshed the ${table} table.`)
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
        const MediaModel = this.determineModelByTable(table)
         if (MediaModel) {
            await this.initAndSyncMediaModel(MediaModel, table, db)
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


    private static async indexMediaFileData(mediaFiles: MediaFileData[], db: Sequelize, table: DatabaseTables) {
        GmukkoLogger.info("Attempting to index files.")
        for (const [i, mediaFile] of mediaFiles.entries()) {
            GmukkoLogger.info(`Indexing File #${i}: ${JSON.stringify(mediaFile)}`)
            switch (table) {
                case (DatabaseTables.StagingMovies):
                    if (Validators.isMovieFileData(mediaFile)) {
                        await this.insertStagingMovieFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Movies)
                    }
                    break
                case (DatabaseTables.StagingShows):
                    if (Validators.isShowFileData(mediaFile)) {
                        await this.insertStagingShowFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Shows)
                    }
                    break
                case (DatabaseTables.StagingStandup):
                    if (Validators.isStandupFileData(mediaFile)) {
                        await this.insertStagingStandupFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Standup)
                    }
                    break
                case (DatabaseTables.StagingAnime):
                    if (Validators.isAnimeFileData(mediaFile)) {
                        await this.insertStagingAnimeFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Anime)
                    }
                    break
                case (DatabaseTables.StagingAnimation):
                    if (Validators.isAnimationFileData(mediaFile)) {
                        await this.insertStagingAnimationFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Animation)
                    }
                    break
                case (DatabaseTables.StagingInternet):
                    if (Validators.isInternetFileData(mediaFile)) {
                        await this.insertStagingInternetFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Internet)
                    }
                    break
                default:
                    if (Validators.isMovieFileData(mediaFile)) {
                        GmukkoLogger.error(`Data is valid media data, but is not structured for the ${table} table.`)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile)
                    }
            }
        }
    }


    private static async insertStagingMovieFileDataIntoTable(movieFileData: MovieFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.StagingMovies} (filePath, title, releaseYear, createdAt, updatedAt)
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
                INSERT INTO ${DatabaseTables.StagingShows} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
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
                INSERT INTO ${DatabaseTables.StagingStandup} (filePath, title, artist, releaseYear, createdAt, updatedAt)
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
                INSERT INTO ${DatabaseTables.StagingAnime} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
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
                INSERT INTO ${DatabaseTables.StagingAnimation} (filePath, title, seasonNumber, episodeNumber, createdAt, updatedAt)
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
                INSERT INTO ${DatabaseTables.StagingInternet} (filePath, title, createdAt, updatedAt)
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
            case DatabaseTables.StagingMovies:
                return MovieFileDataModel
            case DatabaseTables.StagingShows:
                return ShowFileDataModel
            case DatabaseTables.StagingStandup:
                return StandupFileDataModel
            case DatabaseTables.StagingAnime:
                return AnimeFileDataModel
            case DatabaseTables.StagingAnimation:
                return AnimationFileDataModel
            case DatabaseTables.StagingInternet:
                return InternetFileDataModel
            default:
                return undefined
        }
    }
    

    private static async initAndSyncMediaModel(MediaModel: any, table: DatabaseTables, db: Sequelize) {
        try {
            switch (table) {
                case DatabaseTables.StagingMovies:
                    await MediaModel.init(
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
                case DatabaseTables.StagingShows:
                    await MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.StagingStandup:
                    await MediaModel.init(
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
                case DatabaseTables.StagingAnime:
                    await MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.StagingAnimation:
                    await MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.StagingInternet:
                    await MediaModel.init(
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

            await MediaModel.sync()
            GmukkoLogger.info(`Successfully created ${table} table.`)
        } catch (error) {
            GmukkoLogger.error(`Failed to create ${table} table.`, error)
        }
    }
}