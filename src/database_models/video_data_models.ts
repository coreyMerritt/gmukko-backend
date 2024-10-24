import { Model } from "sequelize"


export class VideoDataModel extends Model {
    public filePath!: string
    public title!: string
}

export class MovieDataModel extends VideoDataModel {
    public releaseYear!: number
}

export class ShowDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class StandupDataModel extends VideoDataModel {
    public artist!: string
    public releaseYear!: number
}

export class AnimeDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class AnimationDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class InternetDataModel extends VideoDataModel {

}