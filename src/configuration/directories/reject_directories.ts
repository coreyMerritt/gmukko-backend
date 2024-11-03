import { DatabaseTableNames } from "../db/database_table_names.js"
import { CoreDirectories } from "./core_directories.js"

export enum RejectDirectories {
    Animation = `${CoreDirectories.RejectVideos}/${DatabaseTableNames.Animation}`,
    Anime = `${CoreDirectories.RejectVideos}/${DatabaseTableNames.Anime}`,
    MiscVideo = `${CoreDirectories.RejectVideos}/${DatabaseTableNames.MiscVideo}`,
    Movies = `${CoreDirectories.RejectVideos}/${DatabaseTableNames.Movies}`,
    Shows = `${CoreDirectories.RejectVideos}/${DatabaseTableNames.Shows}`,
    Standup = `${CoreDirectories.RejectVideos}/${DatabaseTableNames.Standup}`
}