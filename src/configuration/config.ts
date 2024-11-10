import { DatabaseNames } from "./db/database_names.js"
import { BackupDirectories } from "./directories/backup_directories.js"
import { CoreDirectories } from "./directories/core_directories.js"
import { LogFiles } from "./directories/logs_paths.js"
import { RootDirectories } from './directories/root_directories.js'
import { VideoTypeDirectories } from "./directories/video_type_directories.js"

interface DatabaseInfo {
    username: string
    password: string
    host: string
    port: number
}

interface ActiveDatabaseNames {
    staging: DatabaseNames
    production: DatabaseNames
    rejection: DatabaseNames
}

interface ActiveBackupDirectories {
    in: string
    out: string
}

interface ActiveCoreDirectories {
    logs: string
    staging: string
    stagingMedia: string
    stagingVideos: string
    production: string
    productionMedia: string
    productionVideos: string
    rejection: string
    rejectionMedia: string
    rejectionVideos: string   
}

interface ActiveLogPaths {
    errors: string
    general: string
    incomingRequest: string
}

interface someVideoTypeDirectories {
    animation: string
    anime: string
    movies: string
    shows: string
    standup: string
    misc: string
}

interface ActiveVideoTypeDirectories {
    staging: someVideoTypeDirectories
    production: someVideoTypeDirectories
    rejection: someVideoTypeDirectories
}

export class Config {

    public static rootDirectory: RootDirectories
    public static databaseNames: ActiveDatabaseNames
    public static databaseInfo: DatabaseInfo
    public static backupDirectories: ActiveBackupDirectories
    public static coreDirectories: ActiveCoreDirectories
    public static logPaths: ActiveLogPaths
    public static videoTypeDirectories: ActiveVideoTypeDirectories


    public static async set(test?: boolean) {
        if (test) {
            this.rootDirectory = RootDirectories.Test
            this.databaseNames.staging = DatabaseNames.TestStaging
            this.databaseNames.production = DatabaseNames.TestProduction
            this.databaseNames.rejection = DatabaseNames.TestRejection
        } else {
            this.rootDirectory = RootDirectories.Live
            this.databaseNames.staging = DatabaseNames.Staging
            this.databaseNames.production = DatabaseNames.Production
            this.databaseNames.rejection = DatabaseNames.Rejection
        }
        
        this.setDatabaseInfo()
        this.setBackupDirectories()
        this.setCoreDirectories()
        this.setLogPaths()
        this.setVideoTypeDirectories()
    }

    private static setDatabaseInfo(): void {
        if (process.env.GMUKKO_BACKEND_USERNAME && process.env.GMUKKO_BACKEND_PASSWORD) {
            this.databaseInfo.username = process.env.GMUKKO_BACKEND_USERNAME
            this.databaseInfo.password = process.env.GMUKKO_BACKEND_PASSWORD
            this.databaseInfo.host = 'localhost'
            this.databaseInfo.port = 3306
        } else {
            throw new Error(`Credentials were not set in the environment variables.`)
        }
    }
    
    private static setBackupDirectories(): void {
        this.backupDirectories.in = `${this.rootDirectory}/${BackupDirectories.In}`
        this.backupDirectories.out = `${this.rootDirectory}/${BackupDirectories.Out}`
    }

    private static setCoreDirectories(): void {
        this.coreDirectories.logs = `${this.rootDirectory}/${CoreDirectories.Logs}`
        this.coreDirectories.staging = `${this.rootDirectory}/${CoreDirectories.Staging}`
        this.coreDirectories.stagingMedia = `${this.rootDirectory}/${CoreDirectories.StagingMedia}`
        this.coreDirectories.stagingVideos = `${this.rootDirectory}/${CoreDirectories.StagingVideos}`
        this.coreDirectories.production = `${this.rootDirectory}/${CoreDirectories.Production}`
        this.coreDirectories.productionMedia = `${this.rootDirectory}/${CoreDirectories.ProductionMedia}`
        this.coreDirectories.productionVideos = `${this.rootDirectory}/${CoreDirectories.ProductionVideos}`
        this.coreDirectories.rejection = `${this.rootDirectory}/${CoreDirectories.Rejection}`
        this.coreDirectories.rejectionMedia = `${this.rootDirectory}/${CoreDirectories.RejectionMedia}`
        this.coreDirectories.rejectionVideos = `${this.rootDirectory}/${CoreDirectories.RejectionVideos}`
    }

    private static setLogPaths(): void {
        this.logPaths.errors = `${this.coreDirectories.logs}/${LogFiles.Errors}`
        this.logPaths.general = `${this.coreDirectories.logs}/${LogFiles.General}`
        this.logPaths.incomingRequest = `${this.coreDirectories.logs}/${LogFiles.IncomingRequest}`
    }

    private static setVideoTypeDirectories(): void {
        this.setStagingVideoTypeDirectories()
        this.setProductionVideoTypeDirectories()
        this.setRejectionVideoTypeDirectories()
    }

    private static setStagingVideoTypeDirectories(): void {
        this.videoTypeDirectories.staging.animation = `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Animation}`
        this.videoTypeDirectories.staging.anime = `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Anime}`
        this.videoTypeDirectories.staging.movies = `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Movies}`
        this.videoTypeDirectories.staging.shows = `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Shows}`
        this.videoTypeDirectories.staging.standup = `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Standup}`
        this.videoTypeDirectories.staging.misc = `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.MiscVideo}`
    }

    private static setProductionVideoTypeDirectories(): void {
        this.videoTypeDirectories.production.animation = `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Animation}`
        this.videoTypeDirectories.production.anime = `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Anime}`
        this.videoTypeDirectories.production.movies = `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Movies}`
        this.videoTypeDirectories.production.shows = `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Shows}`
        this.videoTypeDirectories.production.standup = `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Standup}`
        this.videoTypeDirectories.production.misc = `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.MiscVideo}`
    }

    private static setRejectionVideoTypeDirectories(): void {
        this.videoTypeDirectories.rejection.animation = `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Animation}`
        this.videoTypeDirectories.rejection.anime = `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Anime}`
        this.videoTypeDirectories.rejection.movies = `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Movies}`
        this.videoTypeDirectories.rejection.shows = `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Shows}`
        this.videoTypeDirectories.rejection.standup = `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Standup}`
        this.videoTypeDirectories.rejection.misc = `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.MiscVideo}`
    }
}