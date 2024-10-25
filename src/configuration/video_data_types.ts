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

export interface MovieData extends VideoData {
    filePath: string
    title: string
    releaseYear: number
}

export interface ShowData extends VideoData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface StandupData extends VideoData {
    filePath: string
    title: string
    artist: string
    releaseYear: number
}

export interface AnimeData extends VideoData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface AnimationData extends VideoData {
    filePath: string
    title: string
    seasonNumber: number
    episodeNumber: number
}

export interface InternetData extends VideoData {
    filePath: string
    title: string
}