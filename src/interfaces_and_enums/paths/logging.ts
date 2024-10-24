export enum LoggingPaths {
    LogsDirectory = 'logs',
    IncomingRequest = `${LogsDirectory}/requests`,
    Default = `${LogsDirectory}/general`,
    Errors = `${LogsDirectory}/errors`,
    Debug = `${LogsDirectory}/debug`,
    InvalidJsonArray = `${LogsDirectory}/invalid_json_arrays`,
    InvalidVideoData = `${LogsDirectory}/invalid_video_data`,
    InvalidMovieData = `${LogsDirectory}/invalid_movie_data`,
    InvalidShowData = `${LogsDirectory}/invalid_show_data`,
    InvalidStandupData = `${LogsDirectory}/invalid_standup_data`,
    InvalidAnimeData = `${LogsDirectory}/invalid_anime_data`,
    InvalidAnimationData = `${LogsDirectory}/invalid_animation_data`,
    InvalidInternetData = `${LogsDirectory}/invalid_internet_data`
}