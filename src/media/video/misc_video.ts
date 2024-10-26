import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaStates } from "../media.js"

export class MiscVideo extends Video {
    public model = VideoModel
    public videoType = VideoTypes.Misc
    public tableName = DatabaseTableNames.MiscVideo
    public stagingDirectory = StagingPaths.MiscVideo
    public prompt = new Prompt(this.videoType)
    public state: MediaStates | undefined

    public filePath: string
    public title: string | undefined

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number, state?: MediaStates) {
        super()
        this.filePath = filePath
        this.title = title
        this.state = state
    }

    getVideoType() {
        return VideoTypes.Misc
    }

    getTableName() {
        return DatabaseTableNames.MiscVideo
    }

    getStagingDirectory(): StagingPaths {
        return StagingPaths.MiscVideo
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return VideoModel
    }

    getAttributes() {
        return {
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false}
        }
    }

    getOptions(database: Sequelize, tableName: DatabaseTableNames) {
        return {
            sequelize: database,
            tableName: `${tableName}`
        }
    }
}