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

export function isMovieFileData(object: any): object is MovieFileData {
    return 'filePath' in object &&
        'title' in object &&
        'releaseYear' in object
}

export function isShowFileData(object: any): object is ShowFileData {
    return 'filePath' in object &&
        'title' in object &&
        'releaseYear' in object &&
        'seasonNumber' in object &&
        'episodeNumber' in object
}

export function isStandupFileData(object: any): object is StandupFileData {
    return 'filePath' in object &&
        'title' in object &&
        'artist' in object &&
        'releaseYear' in object
}

export function isAnimeFileData(object: any): object is AnimeFileData {
    return 'filePath' in object &&
        'title' in object &&
        'releaseYear' in object &&
        'seasonNumber' in object &&
        'episodeNumber' in object
}

export function isAnimationFileData(object: any): object is AnimationFileData {
    return 'filePath' in object &&
        'title' in object &&
        'releaseYear' in object &&
        'seasonNumber' in object &&
        'episodeNumber' in object
}

export function isInternetFileData(object: any): object is InternetFileData {
    return 'filePath' in object &&
        'title' in object
}