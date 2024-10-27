export enum AcceptableUserAnswers {
    Index = '1',
    GetStagingIndex = '2',
    PostStagingValidation = '3'
}

export enum Directories {
    StagingMediaValidation = '/mnt/z/gmukko_validation_client',
    StagingMediaValidationBackup = `${StagingMediaValidation}/backup`
}

export enum Files {
    PendingStagingMedia = `pending.yml`,
    AcceptedStagingMedia = `accepted.yml`,
    RejectedStagingMedia = `rejected.yml`
}

export enum Paths {
    PendingStagingMedia = `${Directories.StagingMediaValidation}/${Files.PendingStagingMedia}`,
    AcceptedStagingMedia = `${Directories.StagingMediaValidation}/${Files.AcceptedStagingMedia}`,
    RejectedStagingMedia = `${Directories.StagingMediaValidation}/${Files.RejectedStagingMedia}`,
    PendingStagingMediaBackup = `${Directories.StagingMediaValidationBackup}/${Files.PendingStagingMedia}`,
    AcceptedStagingMediaBackup = `${Directories.StagingMediaValidationBackup}/${Files.AcceptedStagingMedia}`,
    RejectedStagingMediaBackup = `${Directories.StagingMediaValidationBackup}/${Files.RejectedStagingMedia}`
}