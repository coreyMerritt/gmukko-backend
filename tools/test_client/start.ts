import { Directories, Paths } from "./configuration.js"
import fs from 'fs/promises'
import fsSync from 'fs'
import { Menus } from "./menus.js"


class Startup {
    async execute(): Promise<void> {
        try {
            this.createDirectoriesAndFiles()
            await new Menus().main()
        } catch (error) {
            console.error(error)
        }
    }

    private createDirectoriesAndFiles() {
        try {
            for (const [, directory] of Object.values(Directories).entries()) {
                fsSync.mkdirSync(directory, { recursive: true })
            }
            
            for (const [, filePath] of Object.values(Paths).entries()) {
                try {
                    fsSync.accessSync(filePath)
                } catch {
                    fsSync.writeFileSync(filePath, "")
                }
            }
        } catch (error) {
            throw new Error(`Failed to create directories and files.`, { cause: error })
        }
    }
}

new Startup().execute()