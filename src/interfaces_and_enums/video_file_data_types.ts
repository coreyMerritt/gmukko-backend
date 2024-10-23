export enum MediaFileDataTypes {
    Movies = "movies",
    Shows = "shows",
    Standup = "standup",
    Anime = "anime",
    Animation = "animation",
    Internet = "internet"
}

export interface MediaFileData {
    filePath: string
    title: string
}

export interface MovieFileData extends MediaFileData {
    filePath: string
    title: string
    releaseYear: number
}

export interface ShowFileData extends MediaFileData {
    filePath: string
    title: string
    releaseYear: number
    seasonNumber: number
    episodeNumber: number
}

export interface StandupFileData extends MediaFileData {
    filePath: string
    title: string
    artist: string
    releaseYear: number
}

export interface AnimeFileData extends MediaFileData {
    filePath: string
    title: string
    releaseYear: number
    seasonNumber: number
    episodeNumber: number
}

export interface AnimationFileData extends MediaFileData {
    filePath: string
    title: string
    releaseYear: number
    seasonNumber: number
    episodeNumber: number
}

export interface InternetFileData extends MediaFileData {
    filePath: string
    title: string
}