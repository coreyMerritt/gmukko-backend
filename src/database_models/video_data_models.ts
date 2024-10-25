import { DataTypes, Model, Sequelize } from "sequelize"
import { DatabaseTables } from "../configuration/database_tables.js"


export class VideoModel extends Model {
    public filePath!: string
    public title!: string
}

export class MovieModel extends VideoModel {
    public releaseYear!: number
}

export class ShowModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class StandupModel extends VideoModel {
    public artist!: string
    public releaseYear!: number
}

export class AnimeModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class AnimationModel extends VideoModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class InternetModel extends VideoModel {

}

export class ModelAttributesAndOptions {
    
    public static getAttributes(table: DatabaseTables): any  {
        switch (table) {
            case DatabaseTables.Animation:
                return {
                    filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                    title: {type: DataTypes.STRING, allownull: false},
                    seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                    episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                }
            case DatabaseTables.Anime:
                return {
                    filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                    title: {type: DataTypes.STRING, allownull: false},
                    seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                    episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                }
            case DatabaseTables.Movies:
                return {
                    filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                    title: {type: DataTypes.STRING, allownull: false},
                    releaseYear: {type: DataTypes.INTEGER, allowNull: true}
                }
            case DatabaseTables.Shows:
                return {
                    filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                    title: {type: DataTypes.STRING, allownull: false},
                    seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                    episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                }
            case DatabaseTables.Standup:
                return {
                    filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                    title: {type: DataTypes.STRING, allownull: false},
                    artist: {type: DataTypes.STRING, allownull: true},
                    releaseYear: {type: DataTypes.INTEGER, allowNull: true}
                }
            default:
                return {
                    filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                    title: {type: DataTypes.STRING, allownull: false}
                }
        }
    
    }

    public static getOptions(database: Sequelize, table: DatabaseTables) {
        switch (table) {
            case DatabaseTables.Animation:
                return {
                    sequelize: database,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: database,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: database,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: database,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: database,
                    tableName: `${table}`
                }
            default:
                return {
                    sequelize: database,
                    tableName: `${table}`
                }
        }
    }
}