import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/directories/staging_directories.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"
import { all } from "axios"

class AnimationModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class Animation extends Video {
    public mediaType = MediaTypes.Video
    public videoType = VideoTypes.Animation
    public filePath: string
    public title: string
    public seasonNumber: number
    public episodeNumber: number

    constructor(filePath: string, title: string, seasonNumber: number, episodeNumber: number) {
        super()
        this.filePath = filePath
        this.title = title
        this.seasonNumber = seasonNumber
        this.episodeNumber = episodeNumber
    }

    getVideoType() {
        return VideoTypes.Animation
    }

    getTableName() {
        return DatabaseTableNames.Animation
    }

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.Animation
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return AnimationModel
    }

    getAttributes(): object {
        return {
            mediaType: {type: DataTypes.STRING, allownull: false},
            videoType: {type: DataTypes.STRING, allownull: false},
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            seasonNumber: {type: DataTypes.INTEGER, allowNull: false},
            episodeNumber: {type: DataTypes.INTEGER, allowNull: false}
        }
    }
}