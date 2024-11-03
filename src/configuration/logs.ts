export enum LogPaths {
    Default = 'logs'
}

export enum LogFiles {
    IncomingRequest = `${LogPaths.Default}/requests`,
    Default = `${LogPaths.Default}/general`,
    Errors = `${LogPaths.Default}/errors`
}