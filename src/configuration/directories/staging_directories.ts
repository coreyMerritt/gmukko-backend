import { DatabaseTableNames } from "../db/database_table_names.js";
import { CoreDirectories } from "./core_directories.js";

export enum StagingDirectories {
    Animation = `${CoreDirectories.StagingMedia}/${DatabaseTableNames.Animation}`,
    Anime = `${CoreDirectories.StagingMedia}/${DatabaseTableNames.Anime}`,
    MiscVideo = `${CoreDirectories.StagingMedia}/${DatabaseTableNames.MiscVideo}`,
    Movies = `${CoreDirectories.StagingMedia}/${DatabaseTableNames.Movies}`,
    Shows = `${CoreDirectories.StagingMedia}/${DatabaseTableNames.Shows}`,
    Standup = `${CoreDirectories.StagingMedia}/${DatabaseTableNames.Standup}`
}