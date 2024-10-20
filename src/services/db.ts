import { DataTypes, Sequelize, QueryTypes } from 'sequelize'
import MediaFileData from '../interfaces_and_enums/media_file_data.js'
import MediaFileDataModel from '../database_models/media_file_data_model.js'
import { DatabaseTables } from '../interfaces_and_enums/database_tables.js'
import MediaFiles from './media_files.js'

export default class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static database = 'gmukko-backend'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)
    private static db: Sequelize

    public static async refreshMediaDataTable() {
        const db = await this.createAndLoadDatabase(this.database)
        db ? this.db = db : undefined
        await this.createMediaTableIfNotExists()
        const mediaFiles = await MediaFiles.getMediaFileDataToIndex('/mnt/z/media/videos/tv-shows/louie/season-1', [ '.mkv', '.avi', '.mp4', '.mov' ])
        this.indexMediaFileData(mediaFiles)
        console.log(`Done`)
    }


    private static async createAndLoadDatabase(database: string): Promise<Sequelize | undefined> {
        return this.sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
        .then(() => {
            if (this.username && this.password) {
                return new Sequelize(database, this.username, this.password, {
                    host: 'localhost',
                    dialect: 'mysql',
                    logging: false,
                })
            } else {
                console.error("One or more database environment variables are not defined.")
            }
            return undefined
        })
        .catch(error => {
            console.error(`Error creating database: ${database}\n`, error)
            return undefined
        })
    }


    private static async createMediaTableIfNotExists() {
        if (!await this.tableExists(DatabaseTables.MediaData)) {
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
        }
    }


    private static async tableExists(tableName: string) {
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
          
        return result.length > 0
    }


    public static async removeIndexedFilesFromPaths(filePaths: string[]) {
        console.log("Removing already indexed files from list of files to index.")
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
                console.log(`\t\tRemoving ${filePath} from list of files that need to be indexed.`)
                filePaths = filePaths.filter((thisPath) => {
                    thisPath != filePath
                })
            }  else {
                console.log(`\t\tKeeping file ${filePath} to index.`)
            }
        }
        return filePaths
    }


    private static indexMediaFileData(mediaFiles: MediaFileData[]) {
        console.log("Starting indexing")
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
                console.error(`\t\tUnable to index: ${mediaFile}\n${error}\n`)
            }
        }
    }
}