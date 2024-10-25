import { CoreDirectories } from './core_directories.js'

export enum BackupDirectories {
    Output = "./backups",
    Input = `${CoreDirectories.Staging}/backups`
}