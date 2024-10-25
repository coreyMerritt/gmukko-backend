import { StandupModel } from "../../database_models/index.js"
import { DatabaseTables } from "../../interfaces_and_enums/index.js"
import { StagingPaths } from "../../interfaces_and_enums/paths/index.js"
import { Video, VideoTypes } from "./video.js"

export class Standup extends Video {
    public static readonly videoType = VideoTypes.Standup
    public static readonly table = DatabaseTables.Standup
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
}