export enum DatabaseTables {
    Movies = 'movies',
    Shows = 'shows',
    Standup = 'standup',
    Anime = 'anime',
    Animation = 'animation',
    Internet = 'internet',
    StagingMovies ='staging_movies',
    StagingShows ='staging_shows',
    StagingStandup ='staging_standup',
    StagingAnime ='staging_anime',
    StagingAnimation ='staging_animation',
    StagingInternet ='staging_internet'
}

export function getStagingTableDestination(table: DatabaseTables) {
    switch (table) {
        case DatabaseTables.StagingMovies:
            return DatabaseTables.Movies
        case DatabaseTables.StagingShows:
            return DatabaseTables.Shows
        case DatabaseTables.StagingStandup:
            return DatabaseTables.Standup
        case DatabaseTables.StagingAnime:
            return DatabaseTables.Anime
        case DatabaseTables.StagingAnimation:
            return DatabaseTables.Animation
        case DatabaseTables.StagingInternet:
            return DatabaseTables.Internet
        default:
            return DatabaseTables.Internet
    }
}