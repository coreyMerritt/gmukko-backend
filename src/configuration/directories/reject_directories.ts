import { DatabaseTableNames } from "../db/database_table_names.js"
import { CoreDirectories } from "./core_directories.js"

export enum RejectDirectories {
    Animation = `${CoreDirectories.RejectedVideos}/${DatabaseTableNames.Animation}`,
    Anime = `${CoreDirectories.RejectedVideos}/${DatabaseTableNames.Anime}`,
    MiscVideo = `${CoreDirectories.RejectedVideos}/${DatabaseTableNames.MiscVideo}`,
    Movies = `${CoreDirectories.RejectedVideos}/${DatabaseTableNames.Movies}`,
    Shows = `${CoreDirectories.RejectedVideos}/${DatabaseTableNames.Shows}`,
    Standup = `${CoreDirectories.RejectedVideos}/${DatabaseTableNames.Standup}`
}