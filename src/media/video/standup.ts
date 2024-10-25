import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { MediaTypes } from "../media.js"

class StandupModel extends VideoModel {
    public artist!: string
    public releaseYear!: number
}

export class Standup extends Video {
    public videoType = VideoTypes.Standup
    public table = DatabaseTableNames.Standup
    public stagingDirectory = StagingPaths.Standup
    public model = StandupModel
    public prompt = new Prompt(this.videoType)

    public filePath: string
    public title: string | undefined
    public artist: string | undefined
    public releaseYear: number | undefined

    constructor(filePath: string, title?: string, artist?: string, releaseYear?: number) {
        super()
        this.filePath = filePath
        this.title = title
        this.artist = artist
        this.releaseYear = releaseYear
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