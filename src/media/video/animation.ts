import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/staging.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaStates } from "../media.js"

class AnimationModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class Animation extends Video {
    public filePath: string
    public title: string | undefined
    public seasonNumber: number | undefined
    public episodeNumber: number | undefined
    public state: MediaStates | undefined

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number, state?: MediaStates) {
        super()
        this.filePath = filePath
        this.title = title
        this.seasonNumber = seasonNumber
        this.episodeNumber = episodeNumber
        this.state = state
    }

    getVideoType() {
        return VideoTypes.Animation
    }

    getTableName() {
        return DatabaseTableNames.Animation
    }

    getStagingDirectory(): StagingPaths {
        return StagingPaths.Animation
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return AnimationModel
    }

    getAttributes(): object {
        return {
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
        }
    }

    getOptions(database: Sequelize, tableName: DatabaseTableNames): any {
        return {
            sequelize: database,
            tableName: `${tableName}`
        }
    }
}