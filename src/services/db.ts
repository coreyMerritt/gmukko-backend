import { DataTypes, Sequelize, QueryTypes } from 'sequelize'
import { MovieFileDataModel, ShowFileDataModel, StandupFileDataModel, AnimeFileDataModel, AnimationFileDataModel, InternetFileDataModel, MediaDataFileModel } from '../database_models/media_file_data_models.js'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import MediaFiles from './media_files.js'
import { AnimationFileData, AnimeFileData, InternetFileData, isAnimationFileData, isAnimeFileData, isInternetFileData, isMovieFileData, isShowFileData, 
    isStandupFileData, MediaFileData, MovieFileData, ShowFileData, StandupFileData } from '../interfaces_and_enums/video_file_data_types.js'


export default class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static database = 'gmukko-backend'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)
    private static db: Sequelize


    public static async refreshTable(table: DatabaseTables, directoryToIndex: string, validFileTypes: string[]) {
        console.log(`Attempting to refresh the ${table} table...`)
        try {
            const db = await this.createAndLoadDatabase(this.database)
            db ? this.db = db : undefined
            await this.createTableIfNotExists(table)
            const mediaFiles = await MediaFiles.getFileDataToIndex(directoryToIndex, validFileTypes, table)
            this.indexMediaFileData(mediaFiles, table)
            console.log(`Successfully refreshed the ${table} table.`)
        } catch (error) {
            console.log(`Failed to refresh the ${table} table.`)
        }
    }


    private static async createAndLoadDatabase(database: string): Promise<Sequelize | undefined> {
        console.log(`Checking if database is loaded...`)
        if (!this.db) {
            console.log(`\tAttempting to load to database...`)
            try {
                const creationResult = await this.sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
                if (this.username && this.password) {
                    const db = new Sequelize(database, this.username, this.password, {
                        host: 'localhost',
                        dialect: 'mysql',
                        logging: false,
                    })
                    console.log(`\tSuccessfully loaded database.`)
                    return db
                } else {
                    console.log(`\tFailed to load database because username or password were not defined`)
                }
            } catch (error) {
                console.error(`\tFailed to load database.\n`, error)
            }
        } else {
            console.log(`Database is already loaded.`)
        }
    }


    private static async createTableIfNotExists(table: DatabaseTables) {
        if (!await this.tableExists(table)) {
            console.log(`\tAttempting to create ${table}...`)
            const MediaModel = this.determineModelByTable(table)
            if (MediaModel) {
                await this.initAndSyncMediaModel(MediaModel, table)
            }
        }
    }


    private static async tableExists(tableName: string) {
        console.log(`Checking if ${tableName} exists...`)
        try {
            const result = await this.db.query(
                `SELECT * FROM information_schema.tables WHERE table_schema = :databaseName AND table_name = :tableName LIMIT 1;`,
                {
                  replacements: {
                    databaseName: this.db.getDatabaseName(),
                    tableName: tableName,
                  },
                  type: QueryTypes.SELECT,
                }
            )
            if (result.length > 0) {
                console.log(`\tTable ${tableName} does exist.`)
                return true
            } else {
                console.log(`\tTable ${tableName} does not exist.`)
                return false
            }
        } catch (error) {
            console.error(`\tFailed to check if table ${tableName} exists.\n`, error)
        }
    }


    public static async removeIndexedFilesFromPaths(filePaths: string[], table: DatabaseTables) {
        console.log("Attempting to remove already indexed files from list of files to index.")
        try {
            for (const [i, filePath] of filePaths.entries()) {
                console.log(`\tChecking index #: ${i}`)
                console.log(`\tChecking file: ${filePath}`)
                const [results] = await this.db.query(`
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
                    console.log(`\tRemoving ${filePath} from list of files that need to be indexed.`)
                    filePaths = filePaths.filter((thisPath) => {
                        thisPath != filePath
                    })
                }  else {
                    console.log(`\tKeeping file ${filePath} to index.`)
                }
            }
            console.log(`Succesfully removed already indexed files from list of files to index.`)
            return filePaths
        } catch (error) {
            console.error(`Failed to remove already indexed files from list of files to index.\n`, error)
            return []
        }
    }


    private static indexMediaFileData(mediaFiles: MediaFileData[], table: DatabaseTables) {
        console.log("Attempting to index files...")
        for (const [i, mediaFile] of mediaFiles.entries()) {
            console.log(`\tIndexing File #: ${i}`)
            console.log(`\tIndexing File: ${JSON.stringify(mediaFile)}`)
            switch (table) {
                case (DatabaseTables.Movies):
                    if (isMovieFileData(mediaFile)) {
                        this.insertMovieFileDataIntoTable(mediaFile)
                    } else {
                        console.error(`\t\tFile ${mediaFile.filePath} did not match with table type ${table}`)
                    }
                    break
                case (DatabaseTables.Shows):
                    if (isShowFileData(mediaFile)) {
                        this.insertShowFileDataIntoTable(mediaFile)
                    } else {
                        console.error(`\t\tFile ${mediaFile.filePath} did not match with table type ${table}`)
                    }
                    break
                case (DatabaseTables.Standup):
                    if (isStandupFileData(mediaFile)) {
                        this.insertStandupFileDataIntoTable(mediaFile)
                    } else {
                        console.error(`\t\tFile ${mediaFile.filePath} did not match with table type ${table}`)
                    }
                    break
                case (DatabaseTables.Anime):
                    if (isAnimeFileData(mediaFile)) {
                        this.insertAnimeFileDataIntoTable(mediaFile)
                    } else {
                        console.error(`\t\tFile ${mediaFile.filePath} did not match with table type ${table}`)
                    }
                    break
                case (DatabaseTables.Animation):
                    if (isAnimationFileData(mediaFile)) {
                        this.insertAnimationFileDataIntoTable(mediaFile)
                    } else {
                        console.error(`\t\tFile ${mediaFile.filePath} did not match with table type ${table}`)
                    }
                    break
                case (DatabaseTables.Internet):
                    if (isInternetFileData(mediaFile)) {
                        this.insertInternetFileDataIntoTable(mediaFile)
                    } else {
                        console.error(`\t\tFile ${mediaFile} did not match with table type ${table}`)
                    }
                    break 
            }
        }
    }


    private static insertMovieFileDataIntoTable(movieFileData: MovieFileData) {
        try {
            const result =  this.db.query(`
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
            console.log(`\t\tSuccessfully indexed: ${movieFileData.filePath}`)
        } catch (error) {
            console.error(`\t\tFailed to index: ${movieFileData.filePath}\n${error}\n`)
        }
    }

    private static insertShowFileDataIntoTable(showFileData: ShowFileData) {
        try {
            const result =  this.db.query(`
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
            console.log(`\t\tSuccessfully indexed: ${showFileData.filePath}`)
        } catch (error) {
            console.error(`\t\tFailed to index: ${showFileData.filePath}\n${error}\n`)
        }
    }

    private static insertStandupFileDataIntoTable(standupFileData: StandupFileData) {
        try {
            const result =  this.db.query(`
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
            console.log(`\t\tSuccessfully indexed: ${standupFileData.filePath}`)
        } catch (error) {
            console.error(`\t\tFailed to index: ${standupFileData.filePath}\n${error}\n`)
        }
    }

    private static insertAnimeFileDataIntoTable(animeFileData: AnimeFileData) {
        try {
            const result =  this.db.query(`
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
            console.log(`\t\tSuccessfully indexed: ${animeFileData.filePath}`)
        } catch (error) {
            console.error(`\t\tFailed to index: ${animeFileData.filePath}\n${error}\n`)
        }
    }

    private static insertAnimationFileDataIntoTable(animationFileData: AnimationFileData) {
        try {
            const result =  this.db.query(`
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
            console.log(`\t\tSuccessfully indexed: ${animationFileData.filePath}`)
        } catch (error) {
            console.error(`\t\tFailed to index: ${animationFileData.filePath}\n${error}\n`)
        }
    }

    private static insertInternetFileDataIntoTable(internetFileData: InternetFileData) {
        try {
            const result =  this.db.query(`
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
            console.log(`\t\tSuccessfully indexed: ${internetFileData.filePath}`)
        } catch (error) {
            console.error(`\t\tFailed to index: ${internetFileData.filePath}\n${error}\n`)
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
    

    private static async initAndSyncMediaModel(MediaModel: any, table: DatabaseTables) {
        try {
            switch (table) {
                case DatabaseTables.Movies:
                    MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allowNull: false, unique: true},
                            title: {type: DataTypes.STRING, allowNull: false},
                            releaseYear: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: this.db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Shows:
                    MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: this.db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Standup:
                    MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            artist: {type: DataTypes.STRING, allownull: true},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true}
                        },
                        {
                            sequelize: this.db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Anime:
                    MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: this.db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Animation:
                    MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false},
                            releaseYear: {type: DataTypes.INTEGER, allownull: true},
                            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                        },
                        {
                            sequelize: this.db,
                            tableName: `${table}`
                        }
                    )
                    break
                case DatabaseTables.Internet:
                    MediaModel.init(
                        {
                            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                            title: {type: DataTypes.STRING, allownull: false}
                        },
                        {
                            sequelize: this.db,
                            tableName: `${table}`
                        }
                    )
                    break
            }

            await MediaModel.sync()
            console.log(`\tSuccessfully created ${table} table.`)
        } catch (error) {
            console.error(`\tFailed to create ${table} table.\n`, error)
        }
    }
}