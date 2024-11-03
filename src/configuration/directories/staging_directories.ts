import { DatabaseTableNames } from "../db/database_table_names.js"
import { CoreDirectories } from "./core_directories.js"

export enum StagingDirectories {
    Animation = `${CoreDirectories.StagingVideos}/${DatabaseTableNames.Animation}`,
    Anime = `${CoreDirectories.StagingVideos}/${DatabaseTableNames.Anime}`,
    MiscVideo = `${CoreDirectories.StagingVideos}/${DatabaseTableNames.MiscVideo}`,
    Movies = `${CoreDirectories.StagingVideos}/${DatabaseTableNames.Movies}`,
    Shows = `${CoreDirectories.StagingVideos}/${DatabaseTableNames.Shows}`,
    Standup = `${CoreDirectories.StagingVideos}/${DatabaseTableNames.Standup}`
}