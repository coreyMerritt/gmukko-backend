import { DataTypes, Sequelize, QueryTypes } from 'sequelize'
import MediaFileData from '../interfaces_and_enums/media_file_data.js'
import MediaFileDataModel from '../database_models/media_file_data_model.js'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import MediaFiles from './media_files.js'
import { table } from 'console'

export default class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static database = 'gmukko-backend'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)
    private static db: Sequelize

    public static async refreshMediaDataTable() {
        console.log(`Attempting to refresh the ${DatabaseTables.MediaData} table...`)
        try {
            const db = await this.createAndLoadDatabase(this.database)
            db ? this.db = db : undefined
            await this.createMediaTableIfNotExists()
            const mediaFiles = await MediaFiles.getMediaFileDataToIndex('/mnt/z/media/videos/tv-shows/louie/season-1', [ '.mkv', '.avi', '.mp4', '.mov' ])
            this.indexMediaFileData(mediaFiles)
            console.log(`Successfully refreshed the ${DatabaseTables.MediaData} table.`)
        } catch (error) {
            console.log(`Failed to refresh the ${DatabaseTables.MediaData} table.`)
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


    private static async createMediaTableIfNotExists() {
        console.log(`Checking if ${DatabaseTables.MediaData} exists...`)
        if (!await this.tableExists(DatabaseTables.MediaData)) {
            console.log(`\tAttempting to create ${DatabaseTables}...`)
            try {
                MediaFileDataModel.init(
                    {
                        filePath: {
                            type: DataTypes.STRING,
                            allowNull: false,
                            unique: true
                        },
                        type: {
                            type: DataTypes.STRING,
                            allowNull: false
                        },
                        title: {
                            type: DataTypes.STRING,
                            allowNull: false
                        },
                        releaseYear: {
                            type: DataTypes.INTEGER,
                            allowNull: false
                        },
                        seasonNumber: {
                            type: DataTypes.INTEGER,
                            allowNull: true
                        },
                        episodeNumber: {
                            type: DataTypes.INTEGER,
                            allowNull: true
                        }
                    },
                    {
                        sequelize: this.db,
                        tableName: `${DatabaseTables.MediaData}`
                    }
                )
                await MediaFileDataModel.sync()
                console.log(`\tSuccessfully created ${DatabaseTables.MediaData} table.`)
            } catch (error) {
                console.error(`\tFailed to create ${DatabaseTables.MediaData} table.\n`, error)
            }
        }
    }


    private static async tableExists(tableName: string) {
        console.log(`Checking if table ${tableName} exists...`)
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


    public static async removeIndexedFilesFromPaths(filePaths: string[]) {
        console.log("Attempting to remove already indexed files from list of files to index.")
        try {
            for (const [i, filePath] of filePaths.entries()) {
                console.log(`\tChecking index #: ${i}`)
                console.log(`\tChecking file: ${filePath}`)
                const [results] = await this.db.query(`
                    SELECT * 
                    FROM ${DatabaseTables.MediaData} 
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


    private static indexMediaFileData(mediaFiles: MediaFileData[]) {
        console.log("Attempting to index files...")
        for (const [i, mediaFile] of mediaFiles.entries()) {
            console.log(`\tIndexing File #: ${i}`)
            console.log(`\tIndexing File: ${mediaFile}`)
            try {
                const result =  this.db.query(`
                    INSERT INTO ${DatabaseTables.MediaData} (filePath, type, title, releaseYear, seasonNumber, episodeNumber, createdAt, updatedAt)
                    VALUES (:filePath, :type, :title, :releaseYear, :seasonNumber, :episodeNumber, :createdAt, :updatedAt);
                `,
                {
                    replacements: {
                        filePath: mediaFile.filePath,
                        type: mediaFile.type,
                        title: mediaFile.title,
                        releaseYear: mediaFile.releaseYear,
                        seasonNumber: mediaFile.seasonNumber,
                        episodeNumber: mediaFile.episodeNumber,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                })
                console.log(`\t\tSuccessfully indexed: ${mediaFile}`)
            } catch (error) {
                console.error(`\t\tFailed to index: ${mediaFile}\n${error}\n`)
            }
        }
        console.log(`Finished indexing files.`)
    }
}