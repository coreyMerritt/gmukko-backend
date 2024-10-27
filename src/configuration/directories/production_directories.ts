import { DatabaseTableNames } from "../db/database_table_names.js";
import { CoreDirectories } from "./core_directories.js";

export enum ProductionDirectories {
    Animation = `${CoreDirectories.ProductionMedia}/${DatabaseTableNames.Animation}`,
    Anime = `${CoreDirectories.ProductionMedia}/${DatabaseTableNames.Anime}`,
    MiscVideo = `${CoreDirectories.ProductionMedia}/${DatabaseTableNames.MiscVideo}`,
    Movies = `${CoreDirectories.ProductionMedia}/${DatabaseTableNames.Movies}`,
    Shows = `${CoreDirectories.ProductionMedia}/${DatabaseTableNames.Shows}`,
    Standup = `${CoreDirectories.ProductionMedia}/${DatabaseTableNames.Standup}`
}