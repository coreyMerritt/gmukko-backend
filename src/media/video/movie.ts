import { MovieModel } from "../../database_models/index.js"
import { DatabaseTables } from "../../configuration/index.js"
import { StagingPaths } from "../../configuration/index.js"
import { Video, VideoTypes } from "./video.js"

export class Movie extends Video {
    public static readonly videoType = VideoTypes.Movie
    public static readonly table = DatabaseTables.Movies
    public static readonly stagingDir = StagingPaths.Movies
    public static readonly model = MovieModel
    
    public releaseYear: number | undefined

    constructor(filePath: string, title?: string, releaseYear?: number) {
        super(filePath)
        this.filePath = filePath
        title ? this.title = title : undefined
        releaseYear ? this.releaseYear = releaseYear : undefined
    }
}