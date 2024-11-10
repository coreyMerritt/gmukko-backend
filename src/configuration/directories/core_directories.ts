export enum CoreDirectories {
    Logs = `logs`,
    Staging = `staging`,
    StagingMedia = `${Staging}/media`,
    StagingVideos = `${StagingMedia}/videos`,
    Production = `production`,
    ProductionMedia = `${Production}/media`,
    ProductionVideos = `${ProductionMedia}/videos`,
    Rejection = `rejection`,
    RejectionMedia = `${Rejection}/media`,
    RejectionVideos = `${RejectionMedia}/videos`
}