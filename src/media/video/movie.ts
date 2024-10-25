import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"

class MovieModel extends VideoModel {
    public releaseYear!: number
}

export class Movie extends Video {
    public videoType = VideoTypes.Movie
    public table = DatabaseTableNames.Movies
    public stagingDirectory = StagingPaths.Movies
    public model = MovieModel
    public prompt = new Prompt(this.videoType)
    
    public filePath: string
    public title: string | undefined
    public releaseYear: number | undefined

    constructor(filePath: string, title?: string, releaseYear?: number) {
        super()
        this.filePath = filePath
        this.title = title
        this.releaseYear = releaseYear
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