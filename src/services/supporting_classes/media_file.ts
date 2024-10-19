enum MediaType {
    Movie = 'movie',
    Show = 'show',
    StandUp = 'stand-up',
    Anime = 'anime',
    Animation = 'animation',
    Internet = 'internet'
}

export default interface MediaFile {
    filePath: string
    type: MediaType
    title: string
    releaseYear: string
    seasonNumber: string | null
    episodeNumber: string | null
}