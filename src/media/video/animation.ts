import { AnimationModel } from "../../database_models/index.js"
import { DatabaseTables } from "../../interfaces_and_enums/index.js"
import { StagingPaths } from "../../interfaces_and_enums/paths/staging.js"
import { Video, VideoTypes } from "./video.js"

export class Animation extends Video {
    public static readonly videoType = VideoTypes.Animation
    public static readonly table = DatabaseTables.Animation
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
}