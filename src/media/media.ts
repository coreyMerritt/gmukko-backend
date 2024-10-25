import { Model } from "sequelize"
import { DatabaseTables } from "../interfaces_and_enums/index.js"
import { StagingPaths } from "../interfaces_and_enums/paths/staging.js"

export abstract class Media {
    public static readonly table: DatabaseTables
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