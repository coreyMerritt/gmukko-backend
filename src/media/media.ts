import { Model } from "sequelize"
import { DatabaseTableNames } from "../configuration/index.js"
import { StagingPaths } from "../configuration/staging.js"

export abstract class Media {
    public static readonly table: DatabaseTableNames
    public static readonly stagingDirectory: StagingPaths
    public static readonly extensions: string[]
    public static readonly model: any
    
    public filePath: string 
    public title: string | undefined

    constructor(filePath: string) {
        this.filePath = filePath
    }

    getTable() {
        return (this.constructor as typeof Media).table
    }

    getStagingDir() {
        return (this.constructor as typeof Media).stagingDirectory
    }

    getExtensions() {
        return (this.constructor as typeof Media).extensions
    }

    getModel() {
        return (this.constructor as typeof Media).model
    }
}

export enum MediaTypes {
    Video = 'video'
}