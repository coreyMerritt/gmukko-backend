import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"

export class MiscVideo extends Video {
    public static readonly videoType = VideoTypes.Misc
    public static readonly table = DatabaseTableNames.MiscVideo
    public static readonly stagingDir = StagingPaths.Internet
    public static readonly model = VideoModel

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number) {
        super(filePath)
        this.filePath = filePath
        title ? this.title = title : undefined
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