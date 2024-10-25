import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/staging.js"
import { Video, VideoModel, VideoTypes } from "./video.js"
import { Table } from "mysqldump"

class AnimationModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class Animation extends Video {
    public static readonly videoType = VideoTypes.Animation
    public static readonly table = DatabaseTableNames.Animation
    public static readonly stagingDir = StagingPaths.Animation
    public static readonly model = AnimationModel

    public seasonNumber: number | undefined
    public episodeNumber: number | undefined

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number) {
        super(filePath)
        this.filePath = filePath
        title ? this.title = title : undefined
        seasonNumber ? this.seasonNumber = seasonNumber : undefined
        episodeNumber ? this.episodeNumber = episodeNumber : undefined
    }

    getAttributes() {
        return {
            filePath: {type: DataTypes.STRING, allownull: false, unique: true},
            title: {type: DataTypes.STRING, allownull: false},
            seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
            episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
        }
    }

    getOptions(database: Sequelize, tableName: DatabaseTableNames) {
        return {
            sequelize: database,
            tableName: `${tableName}`
        }
    }
}