import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"

class AnimeModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class Anime extends Video {
    public mediaType = MediaTypes.Video
    public videoType = VideoTypes.Anime
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
        return VideoTypes.Anime
    }

    getTableName() {
        return DatabaseTableNames.Anime
    }

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.Anime
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return AnimeModel
    }

    getAttributes() {
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