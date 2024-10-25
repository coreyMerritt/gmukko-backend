import { DatabaseTables } from "../../interfaces_and_enums/index.js"
import { StagingPaths } from "../../interfaces_and_enums/paths/index.js"
import { Video, VideoTypes } from "./video.js"

export class Movie extends Video {
    public static readonly videoType = VideoTypes.Movie
    public static readonly table = DatabaseTables.Movies
    public static readonly stagingDir = StagingPaths.Movies
    
    public releaseYear: number | undefined

    constructor(filePath: string, title?: string, releaseYear?: number) {
        super(filePath)
        this.filePath = filePath
        title ? this.title = title : undefined
        releaseYear ? this.releaseYear = releaseYear : undefined
    }
}