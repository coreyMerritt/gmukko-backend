import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaStates } from "../media.js"

class ShowModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class Show extends Video {
    public model = ShowModel
    public videoType = VideoTypes.Show
    public tableName = DatabaseTableNames.Shows
    public stagingDirectory = StagingPaths.Shows
    public prompt = new Prompt(this.videoType)
    public state: MediaStates | undefined

    public filePath: string
    public title: string | undefined
    public seasonNumber: number | undefined
    public episodeNumber: number | undefined

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number, state?: MediaStates) {
        super()
        this.filePath = filePath
        this.title = title
        this.seasonNumber = seasonNumber
        this.episodeNumber = episodeNumber
        this.state = state
    }

    getVideoType() {
        return VideoTypes.Show
    }

    getTableName() {
        return DatabaseTableNames.Shows
    }

    getStagingDirectory(): StagingPaths {
        return StagingPaths.Shows
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return ShowModel
    }

    getAttributes() {
        return {
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
        }
    }

    getOptions(database: Sequelize, tableName: DatabaseTableNames) {
        return {
            sequelize: database,
            tableName: `${tableName}`
        }
    }
}