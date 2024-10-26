import { AxiosEngine } from "./axios_engine.js"
import { AcceptableUserAnswers } from "./configuration.js"
import { FileEngine } from "./file_engine.js"
import promptSync from 'prompt-sync'


export class Menus {

    public async main(): Promise<void> {
        const userAnswer = this.getUserAnswer()
        const fileEngine = new FileEngine()
        const axios = new AxiosEngine()

        switch (userAnswer) {
            case AcceptableUserAnswers.Get:
                const pendingStagingMedia = await axios.getPendingStagingMedia()
                if (pendingStagingMedia) {
                    await fileEngine.writePendingStagingMedia(pendingStagingMedia)
                } else {
                    console.log(`No pending media to write.`)
                }
                break
            case AcceptableUserAnswers.PostAccepted:
                await axios.postAcceptedStagingMedia()
                break
            case AcceptableUserAnswers.PostRejected:
                await axios.postRejectedStagingMedia()
                break
            case AcceptableUserAnswers.PostAll:
                await axios.postAcceptedStagingMedia()
                await axios.postRejectedStagingMedia()
                break
            default:
                console.error(`Invalid input.`)
        }
        new Menus().main()
    }


    private getUserAnswer(): string {
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
            userAnswer = prompt(`"get" | "post accepted" | "post rejected" | "post all": `)
            userAnswer = userAnswer.toLowerCase()
        }
        return userAnswer
    }
}