export enum AcceptableUserAnswers {
    Backup = '0',
    Index = '1',
    GetStagingIndex = '2',
    PostStagingValidation = '3'
}

export enum Directories {
    ClientDirectory = '/mnt/z/gmukko_test_client',
    ClientDirectoryBackup = `${ClientDirectory}/backup`
}

export enum Files {
    PendingValidation = `pending.yml`,
    AcceptedValidation = `accepted.yml`,
    RejectedValidation = `rejected.yml`
}

export enum Paths {
    PendingValidation = `${Directories.ClientDirectory}/${Files.PendingValidation}`,
    AcceptedValidation = `${Directories.ClientDirectory}/${Files.AcceptedValidation}`,
    RejectedValidation = `${Directories.ClientDirectory}/${Files.RejectedValidation}`,
    PendingValidationBackup = `${Directories.ClientDirectoryBackup}/${Files.PendingValidation}`,
    AcceptedValidationBackup = `${Directories.ClientDirectoryBackup}/${Files.AcceptedValidation}`,
    RejectedValidationBackup = `${Directories.ClientDirectoryBackup}/${Files.RejectedValidation}`
}