import { DataTypes, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoModel, VideoTypes } from "./video.js"

export class MiscVideo extends Video {
    public videoType = VideoTypes.Misc
    public table = DatabaseTableNames.MiscVideo
    public stagingDirectory = StagingPaths.MiscVideo
    public model = VideoModel
    public prompt = new Prompt(this.videoType)

    public filePath: string
    public title: string | undefined

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number) {
        super()
        this.filePath = filePath
        this.title = title
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