export enum LogPaths {
    Default = 'logs'
}

export enum LogFiles {
    IncomingRequest = `${LogPaths.Default}/requests`,
    Default = `${LogPaths.Default}/general`,
    Errors = `${LogPaths.Default}/errors`,
    Debug = `${LogPaths.Default}/debug`,
    InvalidJsonArray = `${LogPaths.Default}/invalid_json_arrays`,
    InvalidVideoData = `${LogPaths.Default}/invalid_video_data`,
    InvalidMovieData = `${LogPaths.Default}/invalid_movie_data`,
    InvalidShowData = `${LogPaths.Default}/invalid_show_data`,
    InvalidStandupData = `${LogPaths.Default}/invalid_standup_data`,
    InvalidAnimeData = `${LogPaths.Default}/invalid_anime_data`,
    InvalidAnimationData = `${LogPaths.Default}/invalid_animation_data`,
    InvalidMiscVideoData = `${LogPaths.Default}/invalid_misc_video_data`
}