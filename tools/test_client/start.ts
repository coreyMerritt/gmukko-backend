import { Directories, Paths } from "./configuration.js"
import fs from 'fs/promises'
import { Menus } from "./menus.js"


class Startup {
    async execute(): Promise<void> {
        try {
            this.createFilesAndDirectories()
            await new Menus().main()
        } catch (error) {
            console.error(error)
        }
    }

    private createFilesAndDirectories() {
        for (const [, directory] of Object.values(Directories).entries()) {
            fs.mkdir(directory, { recursive: true })
        }
        
        for (const [, filePath] of Object.values(Paths).entries()) {
            try {
                fs.access(filePath)
            } catch {
                fs.writeFile(filePath, "")
            }
        }
    }
}

new Startup().execute()