import { DataTypes, Model, Sequelize } from "sequelize"
import { DatabaseTables } from "../interfaces_and_enums/database_tables.js"


export class VideoDataModel extends Model {
    public filePath!: string
    public title!: string
}

export class MovieDataModel extends VideoDataModel {
    public releaseYear!: number
}

export class ShowDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class StandupDataModel extends VideoDataModel {
    public artist!: string
    public releaseYear!: number
}

export class AnimeDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class AnimationDataModel extends VideoDataModel {
    public seasonNumber!: number
    public episodeNumber!: number
}

export class InternetDataModel extends VideoDataModel {

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
                    releaseYear: {type: DataTypes.INTEGER, allowNull: true},
                    seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                    episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
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
                    seasonNumber: {type: DataTypes.INTEGER, allowNull: true},
                    episodeNumber: {type: DataTypes.INTEGER, allowNull: true}
                }
            default:
                return {
                    filePath: {type: DataTypes.STRING, allownull: false, unique: true},
                    title: {type: DataTypes.STRING, allownull: false}
                }
        }
    
    }

    public static getOptions(db: Sequelize, table: DatabaseTables) {
        switch (table) {
            case DatabaseTables.Animation:
                return {
                    sequelize: db,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: db,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: db,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: db,
                    tableName: `${table}`
                }
            case DatabaseTables.Animation:
                return {
                    sequelize: db,
                    tableName: `${table}`
                }
            default:
                return {
                    sequelize: db,
                    tableName: `${table}`
                }
        }
    }
}