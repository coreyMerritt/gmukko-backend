import { ShowModel } from "../../database_models/index.js"
import { DatabaseTables } from "../../interfaces_and_enums/index.js"
import { StagingPaths } from "../../interfaces_and_enums/paths/index.js"
import { Video, VideoTypes } from "./video.js"

export class Show extends Video {
    public static readonly videoType = VideoTypes.Show
    public static readonly table = DatabaseTables.Shows
    public static readonly stagingDir = StagingPaths.Shows
    public static readonly model = ShowModel

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