import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"

class MovieModel extends VideoModel {
    public releaseYear!: number
}

export class Movie extends Video {
    public mediaType = MediaTypes.Video
    public videoType = VideoTypes.Movie
    public filePath: string
    public title: string
    public releaseYear: number

    constructor(filePath: string, title: string, releaseYear: number) {
        super()
        this.filePath = filePath
        this.title = title
        this.releaseYear = releaseYear
    }

    getVideoType() {
        return VideoTypes.Movie
    }

    getTableName() {
        return DatabaseTableNames.Movies
    }

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.Movies
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return MovieModel
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