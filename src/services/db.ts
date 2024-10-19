import { DataTypes, Model, Sequelize, QueryTypes } from 'sequelize'
import MediaData from './database_models/media_data.js'
import MediaFiles from './media_files.js'

export default class Database {
    private static username = process.env.GMUKKO_BACKEND_USERNAME
    private static password = process.env.GMUKKO_BACKEND_PASSWORD
    private static host = 'localhost'
    private static port = '3306'
    private static sequelize = new Sequelize(`mysql://${this.username}:${this.password}@${this.host}:${this.port}`)
    private static db: Sequelize

    public static async refreshMediaDatabase() {
        const db = await this.createDatabaseIfNotExists('gmukko-backend')
        db ? this.db = db : undefined
        await this.createMediaTableIfNotExists()
        console.debug("before getMediaFiles")
        const mediaFiles = await MediaFiles.getMediaFiles('/mnt/z/media/videos/movies/(2001-2010)-shrek', [ '.mkv', '.avi', '.mp4', '.mov' ])
        console.debug("before loop")
        console.debug(mediaFiles.length)
        for (const [i, mediaFile] of mediaFiles.entries()) {
            console.debug(i)
            console.debug(mediaFile.title)
        }
    }

    private static async createDatabaseIfNotExists(database: string): Promise<Sequelize | undefined> {
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
        const tableName = `media_data`

        if (!await this.tableExists(tableName)) {
            MediaData.init(
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
                    tableName: tableName
                }
            )
            await MediaData.sync()
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
}