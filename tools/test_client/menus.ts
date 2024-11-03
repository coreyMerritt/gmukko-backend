import ansi from 'ansi-colors'
import { AxiosEngine } from "./axios_engine.js"
import { FileEngine } from "./file_engine.js"
import { MenuHandler } from "./menu_handler.js"


export enum MainMenuAnswers {
    Exit = 'exit',
    BackupDatabases = '0',
    IndexStagingMedia = '1',
    GetMediaPendingValidation = '2',
    PostAcceptedValidationResults = '3',
    PostRejectedValidationResults = '4',
    PostAllValidationResults = '5'
}

export class Menus {

    private mainMenuPrompt = 
        ansi.magenta(`\nMain Menu:\n`) +
        `\t0) Back Up Databases\n` +
        `\t1) Index Staging\n` +
        `\t2) Get Staging Index\n` +
        `\t3) Post Accepted Validation Response\n` +
        `\t4) Post Rejected Validation Response\n` +
        `\t5) Post All Validation Response\n`


    public async main(): Promise<void> {
        try {
            const menuHandler = new MenuHandler()
            const userAnswer = await menuHandler.getUserInput(this.mainMenuPrompt,Object.values(MainMenuAnswers))
            await this.routeMain(menuHandler, userAnswer)
        } catch (error) {
            console.error(error)
        }

        new Menus().main()
    }

    
    
    private async routeMain(menuHandler: MenuHandler, userAnswer: string): Promise<void> {
        const fileEngine = new FileEngine()
        const axios = new AxiosEngine()
        switch (userAnswer) {
            case MainMenuAnswers.Exit:
                await menuHandler.exit()
            case MainMenuAnswers.BackupDatabases:
                await menuHandler.backupDatabases(axios)
                break
            case MainMenuAnswers.IndexStagingMedia:
                await menuHandler.indexStagingMedia(axios)
                break
            case MainMenuAnswers.GetMediaPendingValidation:
                await menuHandler.getMediaPendingValidation(axios, fileEngine)
                break
            case MainMenuAnswers.PostAcceptedValidationResults:
                await menuHandler.postAcceptedValidationResults(axios,fileEngine)
                break
            case MainMenuAnswers.PostRejectedValidationResults:
                await menuHandler.postRejectedValidationResults(axios,fileEngine)
                break
            case MainMenuAnswers.PostAllValidationResults:
                await menuHandler.postAllValidationResults(axios,fileEngine)
                break
            default:
                menuHandler.defaultMain()
        }
    }
}