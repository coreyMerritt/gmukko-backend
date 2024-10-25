import { GmukkoLogger } from "../core/gmukko_logger.js"
import { Validators } from "../core/validators.js"
import { MediaTypes } from "./media.js"
import { VideoFactory } from "./video/index.js"

export class MediaFactory {
    public static createMedia(object: any) {
        if (Validators.isMedia(object)) {
            switch (object.mediaType) {
                case MediaTypes.Video:
                    return VideoFactory.createVideoFromObject(object)
                default:
                    GmukkoLogger.error(`Object is not valid Media: ${JSON.stringify(object)}`)
            }
        } else {
            GmukkoLogger.error(`Object is not valid Media: ${JSON.stringify(object)}`)
            return VideoFactory.createVideoFromObject(object)
        }
    }
}