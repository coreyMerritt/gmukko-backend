import { CorePaths } from './index.js'

export enum BackupPaths {
    Output = "backups",
    Input = `${CorePaths.Staging}/backups`
}