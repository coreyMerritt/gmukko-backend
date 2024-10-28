import { AxiosEngine } from "./axios_engine.js"
import { Paths } from "./configuration.js"
import { FileEngine } from "./file_engine.js"
import readline from 'readline/promises'


export enum MainMenuAnswers {
    Exit = 'exit',
    Backup = '0',
    Index = '1',
    GetMediaPendingValidation = '2',
    PostValidationResults = '3'
}


export class MenuHandler {

    public async getUserInput(question: string, acceptableAnswers: string[]): Promise<string> {
        try {
            const input = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            var userAnswer: string = ""
            var firstLoop = true
            while (!acceptableAnswers.includes(userAnswer)) {
                !firstLoop ? console.error(`Invalid input.`) : undefined
                firstLoop = false
                userAnswer = (await input.question(question)).trim().toLowerCase()
            }
            input.close()
            return userAnswer
        } catch (error) {
            throw new Error(`Unable to take in user input.\n`)
        }
    }


    public exit() {
        process.exit(0)
    }

    public async backupDatabases(axios: AxiosEngine) {
        try {
            await axios.startDatabaseBackups()
        } catch (error) {
            throw new Error(`Failed to start database backups.`, { cause: error })
        }
    }
    
    public async indexStagingMedia(axios: AxiosEngine) {
        try {
            await axios.startIndexing()
        } catch (error) {
            throw new Error(`Failed to start indexing staged media.`, { cause: error })
        }
    }

    public async getMediaPendingValidation(axios: AxiosEngine, fileEngine: FileEngine) {
        try {
            const mediaPendingValidation = await axios.getMediaPendingValidation()
            if (mediaPendingValidation) {
                await fileEngine.backupValidationFiles()
                await fileEngine.writeObjectAsYaml(mediaPendingValidation)
            } else {
                console.log(`No pending staging media.`)
            }
        } catch (error) {
            throw new Error(`Failed to retrieve media pending validation.`, { cause: error })
        }
    }

    public async postValidationResults(axios: AxiosEngine, fileEngine: FileEngine) {
        try {
            await fileEngine.backupValidationFiles()
            await axios.postStagingValidationResults(Paths.AcceptedValidation)
            await axios.postStagingValidationResults(Paths.RejectedValidation)
            await fileEngine.truncateValidationFiles()
        } catch (error) {
            throw new Error(`Failed to post validation results.`, { cause: error })
        }
    }

    public defaultMain() {
        console.error(`Invalid Input.`)
    }
}