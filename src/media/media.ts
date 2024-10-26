import { Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../configuration/index.js"
import { StagingPaths } from "../configuration/staging.js"

export abstract class Media {
    public abstract filePath: string
    public abstract title: string | undefined
    public abstract state: MediaStates | undefined

    public abstract getMediaType(): MediaTypes
    public abstract getFileExtensions(): string[]
    public abstract getTableName(): DatabaseTableNames
    public abstract getStagingDirectory(): StagingPaths
    public abstract getPrompt(): Prompt
    public abstract getModel(): ModelStatic<Model>
    public abstract getAttributes(): any
    public abstract getOptions(database: Sequelize, tableName: DatabaseTableNames): { sequelize: Sequelize, tableName: string }
}

export enum MediaStates {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected'
}

export enum MediaTypes {
    Video = 'video'
}