export enum AcceptableUserAnswers {
    Get = 'get',
    PostAccepted = 'post accepted',
    PostRejected = 'post rejected',
    PostAll = 'post all'
}

export enum Directories {
    StagingMediaValidation = '/mnt/z/gmukko_validation_client'
}

export enum Files {
    PendingStagingMedia = `pending.yml`,
    AcceptedStagingMedia = `accepted.yml`,
    RejectedStagingMedia = `rejected.yml`
}

export enum Paths {
    PendingStagingMedia = `${Directories.StagingMediaValidation}/${Files.PendingStagingMedia}`,
    AcceptedStagingMedia = `${Directories.StagingMediaValidation}/${Files.AcceptedStagingMedia}`,
    RejectedStagingMedia = `${Directories.StagingMediaValidation}/${Files.RejectedStagingMedia}`
}