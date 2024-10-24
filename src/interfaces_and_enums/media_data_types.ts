export enum MediaDataTypes {
    Movies = "movies",
    Shows = "shows",
    Standup = "standup",
    Anime = "anime",
    Animation = "animation",
    Internet = "internet"
}

export interface MediaData {
    filePath: string
    title: string
}

export interface MovieFileData extends MediaData {
    filePath: string
    title: string
    releaseYear: number
}

export interface ShowFileData extends MediaData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface StandupFileData extends MediaData {
    filePath: string
    title: string
    artist: string
    releaseYear: number
}

export interface AnimeFileData extends MediaData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface AnimationFileData extends MediaData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface InternetFileData extends MediaData {
    filePath: string
    title: string
}