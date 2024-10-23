import fs from 'fs/promises'
import { LoggingPaths } from '../interfaces_and_enums/logging_paths.js'

export default class Startup {
    public static async execute() {
        try {
            await fs.mkdir(LoggingPaths.LogsDirectory)
        } catch (error) {
            // Not a genuine error
        }
    }
}