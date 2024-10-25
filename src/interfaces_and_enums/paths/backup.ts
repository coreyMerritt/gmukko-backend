import { CorePaths } from './core.js'

export enum BackupPaths {
    Output = "backups",
    Input = `${CorePaths.Staging}/backups`
}