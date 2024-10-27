import { AxiosEngine } from "./axios_engine.js"
import { AcceptableUserAnswers, Paths } from "./configuration.js"
import { FileEngine } from "./file_engine.js"
import promptSync from 'prompt-sync'


export class Menus {

    public async main(): Promise<void> {
        const userAnswer = this.getUserInput(
            `Main Menu:\n` +
            `\t0) Back Up Databases\n` +
            `\t1) Index Staging\n` +
            `\t2) Get Staging Index\n` +
            `\t3) Post Staging Validation\n`
        )
        
        await this.executeUserChoice(userAnswer)
        new Menus().main()
    }


    private getUserInput(question: string): string {
        try {
            const prompt = promptSync({
                sigint: true,
                eot: true
            })
            var userAnswer: string = ""
            var firstLoop = true
            var acceptableUserAnswers = Object.values(AcceptableUserAnswers) as string[]
            while (!acceptableUserAnswers.includes(userAnswer)) {
                !firstLoop ? console.error(`Invalid input.`) : undefined
                firstLoop = false
                userAnswer = prompt(question)
                userAnswer = userAnswer.toLowerCase()
            }
            return userAnswer
        } catch (error) {
            throw new Error(`Unable to take in user input.\n`)
        }
    }

    private async executeUserChoice(userAnswer: string) {
        const fileEngine = new FileEngine()
        const axios = new AxiosEngine()
        switch (userAnswer) {
            case AcceptableUserAnswers.Index:
                await axios.startIndexing()
                break
            case AcceptableUserAnswers.GetStagingIndex:
                const pendingStagingMedia = await axios.getPendingStagingMedia()
                if (pendingStagingMedia) {
                    fileEngine.backupFile(Paths.PendingValidation, Paths.AcceptedValidation)
                    fileEngine.backupFile(Paths.AcceptedValidation, Paths.AcceptedValidation)
                    fileEngine.backupFile(Paths.RejectedValidation, Paths.RejectedValidation)
                    await fileEngine.writePendingStagingMedia(pendingStagingMedia)
                    fileEngine
                } else {
                    console.log(`No pending staging media.`)
                }
                break
            case AcceptableUserAnswers.PostStagingValidation:
                await axios.postStagingValidationResults(Paths.AcceptedValidation)
                await axios.postStagingValidationResults(Paths.RejectedValidation)
                break
            default:
                throw new Error(`Invalid input.`)
        }
    }
}