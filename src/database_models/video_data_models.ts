import { Model } from "sequelize"


export class VideoDataModel extends Model {
    public filePath!: string
    public title!: string
}

export class MovieFileDataModel extends VideoDataModel {
    public releaseYear!: number
}

export class ShowFileDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class StandupFileDataModel extends VideoDataModel {
    public artist!: string
    public releaseYear!: number
}

export class AnimeFileDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class AnimationFileDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class InternetFileDataModel extends VideoDataModel {

}