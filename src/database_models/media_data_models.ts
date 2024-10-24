import { Model } from "sequelize"


export class MediaDataFileModel extends Model {
    public filePath!: string
    public title!: string
}

export class MovieFileDataModel extends MediaDataFileModel {
    public filePath!: string
    public title!: string
    public releaseYear!: number
}

export class ShowFileDataModel extends MediaDataFileModel {
    public filePath!: string
    public title!: string
    public seasonNumber!: number
    public episodeNumber!: number
}

export class StandupFileDataModel extends MediaDataFileModel {
    public filePath!: string
    public title!: string
    public artist!: string
    public releaseYear!: number
}

export class AnimeFileDataModel extends MediaDataFileModel {
    public filePath!: string
    public title!: string
    public seasonNumber!: number
    public episodeNumber!: number
}

export class AnimationFileDataModel extends MediaDataFileModel {
    public filePath!: string
    public title!: string
    public seasonNumber!: number
    public episodeNumber!: number
}

export class InternetFileDataModel extends MediaDataFileModel {
    public filePath!: string
    public title!: string
}