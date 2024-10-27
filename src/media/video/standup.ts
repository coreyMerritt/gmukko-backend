import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingDirectories } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"

class StandupModel extends VideoModel {
    public artist!: string
    public releaseYear!: number
}

export class Standup extends Video {
    public mediaType = MediaTypes.Video
    public videoType = VideoTypes.Standup
    public filePath: string
    public title: string
    public artist: string
    public releaseYear: number

    constructor(filePath: string, title: string, artist: string, releaseYear: number) {
        super()
        this.filePath = filePath
        this.title = title
        this.artist = artist
        this.releaseYear = releaseYear
    }

    getVideoType() {
        return VideoTypes.Standup
    }

    getTableName() {
        return DatabaseTableNames.Standup
    }

    getStagingDirectory(): StagingDirectories {
        return StagingDirectories.Standup
    }

    getPrompt() {
        return new Prompt(this.getVideoType())
    }

    getModel(): ModelStatic<Model> {
        return StandupModel
    }

    getAttributes() {
        return {
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            artist: {type: DataTypes.STRING, allownull: true},
            releaseYear: {type: DataTypes.INTEGER, allowNull: true}
        }
    }

    getOptions(database: Sequelize, tableName: DatabaseTableNames) {
        return {
            sequelize: database,
            tableName: `${tableName}`
        }
    }
}