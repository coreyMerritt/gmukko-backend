import { GmukkoLogger } from "../services/gmukko_logger.js"
import { MediaTypes } from "./media.js"
import { VideoFactory } from "./video/index.js"

export class MediaFactory {
    public static createMedia(object: any) {
        if (`mediaType` in object) {
            switch (object.mediaType) {
                case MediaTypes.Video:
                    return VideoFactory.createVideo(object)
                default:
                    return VideoFactory.createVideo(object)
            }
        } else {
            GmukkoLogger.error(`Object is not valid Media: ${JSON.stringify(object)}`)
            return VideoFactory.createVideo(object)
        }
    }
}