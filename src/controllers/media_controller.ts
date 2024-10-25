import { AI, Database, GmukkoLogger, MediaHandler } from '../services/index.js'
import { Animation } from '../media/video/index.js'
import { Prompts } from '../interfaces_and_enums/index.js'

export class MediaController {
    public static async indexStaging(req: any, res: any) {
        const filePaths = await MediaHandler.getFilePaths(Animation.stagingDir, Animation.extensions)
        if (filePaths) {
            const media = await AI.parseAllMediaData(filePaths, Prompts.ReturnAnimationAsJson)
            if (media.length > 0) {
                await Database.indexMedia(media)
            } else {
                GmukkoLogger.info(`No files to index.`)
            }
        } else {
            GmukkoLogger.info(`No files to index.`)
        }
    }
}