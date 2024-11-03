import { DataTypes, Model, ModelStatic } from "sequelize"
import { CoreDirectories, DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/directories/staging_directories.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"
import path from "path"


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

    getTableName(): DatabaseTableNames {
        return DatabaseTableNames.Movies
    }

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.Movies
    }

    getPrompt(): Prompt {
        return new Prompt(this.videoType)
    }

    getModel(): ModelStatic<Model> {
        return MovieModel
    }

    getAttributes(): any {
        return {
            mediaType: {type: DataTypes.STRING, allownull: false},
            videoType: {type: DataTypes.STRING, allownull: false},
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            releaseYear: {type: DataTypes.INTEGER, allowNull: false}
        }
    }

    getProductionFilePath(): string {
        var newBasePath = `${CoreDirectories.ProductionVideos}/${this.getTableName()}`
        var currentFileExtension = path.extname(this.filePath)
        var title = this.prepStringForFileName(this.title)
        return `${newBasePath}/(${this.releaseYear})-${title}${currentFileExtension}`
    }

    getRejectFilePath(): string {
        var newBasePath = `${CoreDirectories.RejectVideos}/${this.getTableName()}`
        var currentFileExtension = path.extname(this.filePath)
        var title = this.prepStringForFileName(this.title)
        return `${newBasePath}/(${this.releaseYear})-${title}${currentFileExtension}`
    }
}