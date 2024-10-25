import { AnimeModel } from "../../database_models/index.js"
import { DatabaseTableNames } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoTypes } from "./video.js"

export class Anime extends Video {
    public static readonly videoType = VideoTypes.Anime
    public static readonly table = DatabaseTableNames.Anime
    public static readonly stagingDir = StagingPaths.Anime
    public static readonly model = AnimeModel

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