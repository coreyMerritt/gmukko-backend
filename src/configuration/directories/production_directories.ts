import { DatabaseTableNames } from "../db/database_table_names.js";
import { CoreDirectories } from "./core_directories.js";

export enum ProductionDirectories {
    Animation = `${CoreDirectories.ProductionVideos}/${DatabaseTableNames.Animation}`,
    Anime = `${CoreDirectories.ProductionVideos}/${DatabaseTableNames.Anime}`,
    MiscVideo = `${CoreDirectories.ProductionVideos}/${DatabaseTableNames.MiscVideo}`,
    Movies = `${CoreDirectories.ProductionVideos}/${DatabaseTableNames.Movies}`,
    Shows = `${CoreDirectories.ProductionVideos}/${DatabaseTableNames.Shows}`,
    Standup = `${CoreDirectories.ProductionVideos}/${DatabaseTableNames.Standup}`
}