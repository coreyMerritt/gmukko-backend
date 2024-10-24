export enum VideoDataTypes {
    Movies = "movies",
    Shows = "shows",
    Standup = "standup",
    Anime = "anime",
    Animation = "animation",
    Internet = "internet"
}

export interface VideoData {
    filePath: string
    title: string
}

export interface MovieFileData extends VideoData {
    filePath: string
    title: string
    releaseYear: number
}

export interface ShowFileData extends VideoData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface StandupFileData extends VideoData {
    filePath: string
    title: string
    artist: string
    releaseYear: number
}

export interface AnimeFileData extends VideoData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface AnimationFileData extends VideoData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface InternetFileData extends VideoData {
    filePath: string
    title: string
}