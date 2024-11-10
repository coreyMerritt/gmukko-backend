export enum CoreDirectories {
    Staging = `/mnt/z/gmukko_staging`,
    StagingMedia = `${Staging}/media`,
    StagingVideos = `${StagingMedia}/videos`,
    Production = '/mnt/z/gmukko_production',
    ProductionMedia = `${Production}/media`,
    ProductionVideos = `${ProductionMedia}/videos`,
    Rejected = `/mnt/z/gmukko_rejected`,
    RejectedMedia = `${Rejected}/media`,
    RejectedVideos = `${RejectedMedia}/videos`
}

export enum TestCoreDirectories {
    Staging = `/mnt/z/test/gmukko_staging`,
    StagingMedia = `${Staging}/media`,
    StagingVideos = `${StagingMedia}/videos`,
    Production = '/mnt/z/test/gmukko_production',
    ProductionMedia = `${Production}/media`,
    ProductionVideos = `${ProductionMedia}/videos`,
    Rejected = `/mnt/z/test/gmukko_rejected`,
    RejectedMedia = `${Rejected}/media`,
    RejectedVideos = `${RejectedMedia}/videos`
}