import { DataTypes, Model, ModelStatic } from "sequelize"
import { DatabaseTableNames } from "../../configuration/db/index.js"
import { Prompt } from "../../core/prompt.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"
import path from "path"
import { Config } from "../../configuration/config.js"


class MiscVideoModel extends VideoModel {}


export class MiscVideo extends Video {
    public mediaType = MediaTypes.Video
    public videoType = VideoTypes.Misc
    public filePath: string
    public title: string

    constructor(filePath: string, title: string) {
        super()
        this.filePath = filePath
        this.title = title
    }

    getTableName(): DatabaseTableNames {
        return DatabaseTableNames.MiscVideo
    }

    getStagingDirectory(): string {
        return Config.videoTypeDirectories.staging.misc
    }

    getPrompt(): Prompt {
        return new Prompt(this.videoType)
    }

    getModel(): ModelStatic<Model> {
        return MiscVideoModel
    }

    getAttributes(): any {
        return {
            mediaType: {type: DataTypes.STRING, allownull: false},
            videoType: {type: DataTypes.STRING, allownull: false},
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false}
        }
    }

    getProductionFilePath(): string {
        var newBasePath = `${Config.coreDirectories.productionVideos}/${this.getTableName()}`
        var currentFileExtension = path.extname(this.filePath)
        var title = this.prepStringForFileName(this.title)
        return `${newBasePath}/${title}${currentFileExtension}`
    }

    getRejectFilePath(): string {
        var newBasePath = `${Config.coreDirectories.rejectionVideos}/${this.getTableName()}`
        var currentFileExtension = path.extname(this.filePath)
        var title = this.prepStringForFileName(this.title)
        return `${newBasePath}/${title}${currentFileExtension}`
    }
}