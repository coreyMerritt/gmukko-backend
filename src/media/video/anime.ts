import { DataTypes, Model, ModelStatic } from "sequelize"
import { CoreDirectories, DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/directories/staging_directories.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"
import path from "path"


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

    getTableName(): DatabaseTableNames {
        return DatabaseTableNames.Anime
    }

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.Anime
    }

    getPrompt(): Prompt {
        return new Prompt(this.videoType)
    }

    getModel(): ModelStatic<Model> {
        return AnimeModel
    }

    getAttributes(): any {
        return {
            mediaType: {type: DataTypes.STRING, allownull: false},
            videoType: {type: DataTypes.STRING, allownull: false},
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            seasonNumber: {type: DataTypes.INTEGER, allowNull: false},
            episodeNumber: {type: DataTypes.INTEGER, allowNull: false}
        }
    }

    getProductionFilePath(): string {
        var newBasePath = `${CoreDirectories.ProductionVideos}/${this.getTableName()}`
        var currentFileExtension = path.extname(this.filePath)
        var title = this.prepStringForFileName(this.title)
        var seasonNumber = String(this.seasonNumber).padStart(2, '0')
        var episodeNumber = String(this.episodeNumber).padStart(2, '0')
        return `${newBasePath}/${title}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
    }

    getRejectFilePath(): string {
        var newBasePath = `${CoreDirectories.RejectVideos}/${this.getTableName()}`
        var currentFileExtension = path.extname(this.filePath)
        var title = this.prepStringForFileName(this.title)
        var seasonNumber = String(this.seasonNumber).padStart(2, '0')
        var episodeNumber = String(this.episodeNumber).padStart(2, '0')
        return `${newBasePath}/${title}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
    }
}