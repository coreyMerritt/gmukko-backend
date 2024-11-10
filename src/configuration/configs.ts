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

export class Configs {

    public static rootDirectory: RootDirectories
    public static databaseNames: ActiveDatabaseNames
    public static databaseInfo: DatabaseInfo
    public static backupDirectories: ActiveBackupDirectories
    public static coreDirectories: ActiveCoreDirectories
    public static logPaths: ActiveLogPaths
    public static videoTypeDirectories: ActiveVideoTypeDirectories


    public static set(test?: boolean) {
        if (test) {
            this.rootDirectory = RootDirectories.Test
            this.databaseNames = {
                staging: DatabaseNames.TestStaging,
                production: DatabaseNames.TestProduction,
                rejection: DatabaseNames.TestRejection
            }
        } else {
            this.rootDirectory = RootDirectories.Live
            this.databaseNames = {
                staging: DatabaseNames.Staging,
                production: DatabaseNames.Production,
                rejection: DatabaseNames.Rejection
            }
        }
        
        this.setDatabaseInfo()
        this.setBackupDirectories()
        this.setCoreDirectories()
        this.setLogPaths()
        this.setVideoTypeDirectories()
    }

    private static setDatabaseInfo(): void {
        if (process.env.GMUKKO_BACKEND_USERNAME && process.env.GMUKKO_BACKEND_PASSWORD) {
            this.databaseInfo = {
                username: process.env.GMUKKO_BACKEND_USERNAME,
                password: process.env.GMUKKO_BACKEND_PASSWORD,
                host: 'localhost',
                port: 3306
            }
        } else {
            throw new Error(`Credentials were not set in the environment variables.`)
        }
    }
    
    private static setBackupDirectories(): void {
        this.backupDirectories = {
            in: `${this.rootDirectory}/${BackupDirectories.In}`,
            out: `${this.rootDirectory}/${BackupDirectories.Out}`
        }
    }

    private static setCoreDirectories(): void {
        this.coreDirectories = {
            logs: `${this.rootDirectory}/${CoreDirectories.Logs}`,
            staging: `${this.rootDirectory}/${CoreDirectories.Staging}`,
            stagingMedia: `${this.rootDirectory}/${CoreDirectories.StagingMedia}`,
            stagingVideos: `${this.rootDirectory}/${CoreDirectories.StagingVideos}`,
            production: `${this.rootDirectory}/${CoreDirectories.Production}`,
            productionMedia: `${this.rootDirectory}/${CoreDirectories.ProductionMedia}`,
            productionVideos: `${this.rootDirectory}/${CoreDirectories.ProductionVideos}`,
            rejection: `${this.rootDirectory}/${CoreDirectories.Rejection}`,
            rejectionMedia: `${this.rootDirectory}/${CoreDirectories.RejectionMedia}`,
            rejectionVideos: `${this.rootDirectory}/${CoreDirectories.RejectionVideos}`
        }
    }

    private static setLogPaths(): void {
        this.logPaths = {
            errors: `${this.coreDirectories.logs}/${LogFiles.Errors}`,
            general: `${this.coreDirectories.logs}/${LogFiles.General}`,
            incomingRequest: `${this.coreDirectories.logs}/${LogFiles.IncomingRequest}`
        }
    }

    private static setVideoTypeDirectories(): void {
        this.videoTypeDirectories = {
            staging: {
                animation: `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Animation}`,
                anime: `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Anime}`,
                movies: `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Movies}`,
                shows: `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Shows}`,
                standup: `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.Standup}`,
                misc: `${this.coreDirectories.stagingVideos}/${VideoTypeDirectories.MiscVideo}`
            },
            production: {
                animation: `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Animation}`,
                anime: `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Anime}`,
                movies: `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Movies}`,
                shows: `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Shows}`,
                standup: `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.Standup}`,
                misc: `${this.coreDirectories.productionVideos}/${VideoTypeDirectories.MiscVideo}`
            },
            rejection: {
                animation: `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Animation}`,
                anime: `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Anime}`,
                movies: `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Movies}`,
                shows: `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Shows}`,
                standup: `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.Standup}`,
                misc: `${this.coreDirectories.rejectionVideos}/${VideoTypeDirectories.MiscVideo}`
            }
        }
    }
}