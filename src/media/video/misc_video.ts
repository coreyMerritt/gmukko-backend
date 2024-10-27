import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"

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

    getVideoType() {
        return VideoTypes.Misc
    }

    getTableName() {
        return DatabaseTableNames.MiscVideo
    }

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.MiscVideo
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return VideoModel
    }

    getAttributes() {
        return {
            mediaType: {type: DataTypes.STRING, allownull: false},
            videoType: {type: DataTypes.STRING, allownull: false},
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false}
        }
    }
}