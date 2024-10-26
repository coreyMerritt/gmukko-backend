import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaStates } from "../media.js"

class MovieModel extends VideoModel {
    public releaseYear!: number
}

export class Movie extends Video {
    public model = MovieModel
    public videoType = VideoTypes.Movie
    public tableName = DatabaseTableNames.Movies
    public stagingDirectory = StagingPaths.Movies
    public prompt = new Prompt(this.videoType)
    public state: MediaStates | undefined
    
    public filePath: string
    public title: string | undefined
    public releaseYear: number | undefined

    constructor(filePath: string, title?: string, releaseYear?: number, state?: MediaStates) {
        super()
        this.filePath = filePath
        this.title = title
        this.releaseYear = releaseYear
        this.state = state
    }

    getVideoType() {
        return VideoTypes.Movie
    }

    getTableName() {
        return DatabaseTableNames.Movies
    }

    getStagingDirectory(): StagingPaths {
        return StagingPaths.Movies
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