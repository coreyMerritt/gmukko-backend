import { InternetModel } from "../../database_models/index.js"
import { DatabaseTableNames } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoTypes } from "./video.js"

export class MiscVideo extends Video {
    public static readonly videoType = VideoTypes.Misc
    public static readonly table = DatabaseTableNames.MiscVideo
    public static readonly stagingDir = StagingPaths.Internet
    public static readonly model = InternetModel

    constructor(filePath: string, title?: string, seasonNumber?: number, episodeNumber?: number) {
        super(filePath)
        this.filePath = filePath
        title ? this.title = title : undefined
    }
}