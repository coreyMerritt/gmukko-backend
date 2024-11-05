export enum LogPaths {
    Default = 'logs'
}

export enum LogFiles {
    IncomingRequest = `${LogPaths.Default}/requests`,
    General = `${LogPaths.Default}/general`,
    Errors = `${LogPaths.Default}/errors`
}