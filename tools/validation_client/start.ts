import { Directories, Paths } from "./configuration.js"
import fs from 'fs/promises'
import { Menus } from "./menus.js"


class Startup {
    async execute(): Promise<void> {
        this.createFilesAndDirectories()
        
        new Menus().main()
    }

    async createFilesAndDirectories() {
        for (const [, directory] of Object.values(Directories).entries()) {
            fs.mkdir(directory, { recursive: true })
        }
        for (const [, filePath] of Object.values(Paths).entries()) {
            fs.writeFile(filePath, "")
        }
    }
}
new Startup().execute()