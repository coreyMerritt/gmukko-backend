import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"

class MovieModel extends VideoModel {
    public releaseYear!: number
}

export class Movie extends Video {
    public static readonly videoType = VideoTypes.Movie
    public static readonly table = DatabaseTableNames.Movies
    public static readonly stagingDir = StagingPaths.Movies
    public static readonly model = MovieModel
    
    public releaseYear: number | undefined

    constructor(filePath: string, title?: string, releaseYear?: number) {
        super(filePath)
        this.filePath = filePath
        title ? this.title = title : undefined
        releaseYear ? this.releaseYear = releaseYear : undefined
    }

    getAttributes() {
        return {
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            releaseYear: {type: DataTypes.INTEGER, allowNull: true}
        }
    }

    getOptions(database: Sequelize, tableName: DatabaseTableNames) {
        return {
            sequelize: database,
            tableName: `${tableName}`
        }
    }
}