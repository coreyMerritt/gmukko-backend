import { Model, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../configuration/index.js"
import { StagingPaths } from "../configuration/staging.js"

export abstract class Media {
    public abstract mediaType: MediaTypes
    public abstract table: DatabaseTableNames
    public abstract stagingDirectory: StagingPaths
    public abstract fileExtensions: string[]
    public abstract model: any
    public abstract prompt: Prompt
    
    public abstract filePath: string
    public abstract title: string | undefined

    abstract getAttributes(): any
    abstract getOptions(database: Sequelize, tableName: DatabaseTableNames): { sequelize: Sequelize, tableName: string }
}

export enum MediaTypes {
    Video = 'video'
}