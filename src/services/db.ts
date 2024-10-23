import { DataTypes, Sequelize, QueryTypes } from 'sequelize'
import { MovieFileDataModel, ShowFileDataModel, StandupFileDataModel, AnimeFileDataModel, AnimationFileDataModel, InternetFileDataModel, MediaDataFileModel } from '../database_models/media_file_data_models.js'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import MediaFiles from './media_files.js'
import { AnimationFileData, AnimeFileData, InternetFileData, MediaFileData, MediaFileDataTypes, MovieFileData, ShowFileData, StandupFileData } from '../interfaces_and_enums/video_file_data_types.js'
import GmukkoLogger from './gmukko_logger.js'
import Validators from './validators.js'


export default class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static databaseName = 'gmukko-backend'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)


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

            if (result.length > 0) {
                GmukkoLogger.info(`Table ${table} does exist.`)
                return true
            } else {
                GmukkoLogger.info(`Table ${table} does not exist.`)
                return false
            }
            
        } catch (error) {
            GmukkoLogger.error(`Failed to check if table ${table} exists.`, error)
        }
    }


    public static async removeIndexedFilesFromPaths(filePaths: string[], db: Sequelize, table: DatabaseTables) {
        GmukkoLogger.info("Attempting to remove already indexed files from list of files to index.")
        try {
            for (const [i, filePath] of filePaths.entries()) {
                GmukkoLogger.info(`\tChecking file #${i}: ${filePath}`)
                const [results] = await db.query(`
                    SELECT * 
                    FROM ${table} 
                    WHERE filePath = :filePath
                `,
                {
                    replacements: { 
                        filePath: filePath
                    }
                })
                if (results.length > 0) {
                    GmukkoLogger.info(`Removing ${filePath} from list of files that need to be indexed.`)
                    filePaths = filePaths.filter((thisPath) => {
                        thisPath != filePath
                    })
                }  else {
                    GmukkoLogger.info(`Keeping file ${filePath} to index.`)
                }
            }
            GmukkoLogger.info(`Succesfully removed already indexed files from list of files to index.`)
            return filePaths
        } catch (error) {
            GmukkoLogger.error(`Failed to remove already indexed files from list of files to index.`, error)
            return []
        }
    }


    private static async indexMediaFileData(mediaFiles: MediaFileData[], db: Sequelize, table: DatabaseTables) {
        GmukkoLogger.info("Attempting to index files.")
        for (const [i, mediaFile] of mediaFiles.entries()) {
            GmukkoLogger.info(`Indexing File #${i}: ${JSON.stringify(mediaFile)}`)
            switch (table) {
                case (DatabaseTables.Movies):
                    if (Validators.isMovieFileData(mediaFile)) {
                        await this.insertMovieFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Movies)
                    }
                    break
                case (DatabaseTables.Shows):
                    if (Validators.isShowFileData(mediaFile)) {
                        await this.insertShowFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Shows)
                    }
                    break
                case (DatabaseTables.Standup):
                    if (Validators.isStandupFileData(mediaFile)) {
                        await this.insertStandupFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Standup)
                    }
                    break
                case (DatabaseTables.Anime):
                    if (Validators.isAnimeFileData(mediaFile)) {
                        await this.insertAnimeFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Anime)
                    }
                    break
                case (DatabaseTables.Animation):
                    if (Validators.isAnimationFileData(mediaFile)) {
                        await this.insertAnimationFileDataIntoTable(mediaFile, db)
                    } else {
                        GmukkoLogger.invalidMediaData(mediaFile, MediaFileDataTypes.Animation)
                    }
                    break
                case (DatabaseTables.Internet):
                    if (Validators.isInternetFileData(mediaFile)) {
                        await this.insertInternetFileDataIntoTable(mediaFile, db)
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


    private static async insertMovieFileDataIntoTable(movieFileData: MovieFileData, db: Sequelize) {
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

    private static async insertShowFileDataIntoTable(showFileData: ShowFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Shows} (filePath, title, releaseYear, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :releaseYear, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: showFileData.filePath,
                    title: showFileData.title,
                    releaseYear: showFileData.releaseYear,
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

    private static async insertStandupFileDataIntoTable(standupFileData: StandupFileData, db: Sequelize) {
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

    private static async insertAnimeFileDataIntoTable(animeFileData: AnimeFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Anime} (filePath, title, releaseYear, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :releaseYear, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: animeFileData.filePath,
                    title: animeFileData.title,
                    releaseYear: animeFileData.releaseYear,
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

    private static async insertAnimationFileDataIntoTable(animationFileData: AnimationFileData, db: Sequelize) {
        try {
            const result = await db.query(`
                INSERT INTO ${DatabaseTables.Animation} (filePath, title, releaseYear, seasonNumber, episodeNumber, createdAt, updatedAt)
                VALUES (:filePath, :title, :releaseYear, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
            `,
            {
                replacements: {
                    filePath: animationFileData.filePath,
                    title: animationFileData.title,
                    releaseYear: animationFileData.releaseYear,
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

    private static async insertInternetFileDataIntoTable(internetFileData: InternetFileData, db: Sequelize) {
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
    

    private static async initAndSyncMediaModel(MediaModel: any, table: DatabaseTables, db: Sequelize) {
        try {
            switch (table) {
                case DatabaseTables.Movies:
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
                case DatabaseTables.Shows:
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
                case DatabaseTables.Standup:
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
                case DatabaseTables.Anime:
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
                case DatabaseTables.Animation:
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
                case DatabaseTables.Internet:
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