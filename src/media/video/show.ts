import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"

class ShowModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class Show extends Video {
    public videoType = VideoTypes.Show
    public table = DatabaseTableNames.Shows
    public stagingDirectory = StagingPaths.Shows
    public model = ShowModel
    public prompt = new Prompt(this.videoType)

    public filePath: string
    public title: string | undefined
    public seasonNumber: number | undefined
    public episodeNumber: number | undefined

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number) {
        super()
        this.filePath = filePath
        this.title = title
        this.seasonNumber = seasonNumber
        this.episodeNumber = episodeNumber
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