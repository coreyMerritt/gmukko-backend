import { DataTypes, Model, ModelStatic } from "sequelize"
import { CoreDirectories, DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"
import path from "path"


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

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.MiscVideo
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
        var newBasePath = `${CoreDirectories.ProductionVideos}/${this.getTableName()}`
        var currentFileExtension = path.extname(this.filePath)
        var title = this.prepStringForFileName(this.title)
        return `${newBasePath}/${title}${currentFileExtension}`
    }
}