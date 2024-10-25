import { DatabaseTables } from "../../interfaces_and_enums/index.js"
import { StagingPaths } from "../../interfaces_and_enums/paths/index.js"
import { Video, VideoTypes } from "./video.js"

export class Anime extends Video {
    public static readonly videoType = VideoTypes.Anime
    public static readonly table = DatabaseTables.Anime
    public static readonly stagingDir = StagingPaths.Anime

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