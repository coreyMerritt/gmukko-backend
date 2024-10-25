import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"

class StandupModel extends VideoModel {
    public artist!: string
    public releaseYear!: number
}

export class Standup extends Video {
    public static readonly videoType = VideoTypes.Standup
    public static readonly table = DatabaseTableNames.Standup
    public static readonly stagingDir = StagingPaths.Standup
    public static readonly model = StandupModel

    public artist: string | undefined
    public releaseYear: number | undefined

    constructor(filePath: string, title?: string, artist?: string, releaseYear?: number) {
        super(filePath)
        this.filePath = filePath
        title ? this.title = title : undefined
        artist ? this.artist = artist : undefined
        this.releaseYear ? this.releaseYear = releaseYear : undefined
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