import { Model } from "sequelize"

enum TypeOfMedia {
    Movie = 'movie',
    Show = 'show',
    StandUp = 'stand-up',
    Anime = 'anime',
    Animation = 'animation',
    Internet = 'internet'
}

export default class MediaData extends Model {
    public filePath!: string
    public type!: TypeOfMedia
    public title!: string
    public releaseYear!: number
    public seasonNumber!: number | null
    public episodeNumber!: number | null
}