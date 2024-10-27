import { Model, ModelStatic, Sequelize } from "sequelize"
import { DatabaseTableNames, Prompt } from "../configuration/index.js"
import { StagingDirectories } from "../configuration/directories/staging_directories.js"

export abstract class Media {
    public abstract mediaType: MediaTypes

    public abstract filePath: string
    public abstract title: string

    public abstract getFileExtensions(): string[]
    public abstract getTableName(): DatabaseTableNames
    public abstract getStagingDirectory(): StagingDirectories
    public abstract getPrompt(): Prompt
    public abstract getModel(): ModelStatic<Model>
    public abstract getAttributes(): any
}

export enum MediaTypes {
    Video = 'video'
}