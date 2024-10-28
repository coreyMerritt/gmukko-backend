import { ValidationRequest } from '../controllers/media_controller.js'
import { Media, MediaTypes } from '../media/media.js'
import { Anime, Animation, MiscVideo, Movie, Show, Standup, Video, VideoTypes } from '../media/video/index.js'
import { GmukkoLogger } from './gmukko_logger.js'


export class Validators {
   
    public static isMedia(object: object): object is Media {
        return 'filePath' in object && 'title' in object && 
            object.filePath && object.title ? true : false
    }

    public static isVideo(object: object): object is Video {
        return 'filePath' in object && 'title' in object && 
            object.filePath && object.title ? true : false
    }

    public static isMovie(object: any): object is Movie {
        return 'filePath' in object && 'title' in object && 'releaseYear' in object && 
            object.filePath && object.title && object.releaseYear
    }
    
    public static isShow(object: any): object is Show {
        return 'filePath' in object && 'title' in object && 'seasonNumber' in object && 'episodeNumber' in object && 
            object.filePath && object.title && object.seasonNumber && object.episodeNumber
    }
    
    public static isStandup(object: any): object is Standup {
        return 'filePath' in object && 'title' in object && 'releaseYear' in object && 'artist' in object && 
            object.filePath && object.title && object.releaseYear && object.artist
    }
    
    public static isAnime(object: any): object is Anime {
        return 'filePath' in object && 'title' in object && 'seasonNumber' in object && 'episodeNumber' in object &&
            object.filePath && object.title && object.seasonNumber && object.episodeNumber
    }
    
    public static isAnimation(object: any): object is Animation {
        return 'filePath' in object && 'title' in object && 'seasonNumber' in object && 'episodeNumber' in object &&
            object.filePath && object.title && object.seasonNumber && object.episodeNumber
    }
    
    public static isMiscVideo(object: any): object is MiscVideo {
        return 'filePath' in object && 'title' in object &&
            object.filePath && object.title
     }

    public static isMediaArray(objectArray: object[]): objectArray is Media[] {
        for (const [, object] of objectArray.entries()) {
            if (!Validators.isMedia(object)) {
                return false
            }
        }
        return true
    }

    public static isVideoArray(objectArray: object[]): objectArray is Video[] {
        for (const [, object] of objectArray.entries()) {
            if (!Validators.isVideo(object)) {
                return false
            }
        }
        return true
    }

    public static isMediaType(someString: string): someString is MediaTypes {
        const videoTypes = Object.values(VideoTypes) as string[]
        if (videoTypes.includes(someString)) {
            return true
        } else {
            return false
        }
    }

    public static isVideoType(someString: string): someString is VideoTypes {
        const videoTypes = Object.values(VideoTypes) as string[]
        if (videoTypes.includes(someString)) {
            return true
        } else {
            return false
        }
    }

    public static isValidationRequest(object: object): object is ValidationRequest {
        if ('tables' in object && typeof object.tables === 'object' && object.tables !== null) {
            for (const [, someArray] of Object.values(object.tables).entries()) {
                if (!this.isMediaArray(someArray)) {
                    GmukkoLogger.error(`Not a validation request... Not valid media: ${JSON.stringify(someArray)}`)
                    return false
                }
                for (const [, media] of Object.values(someArray).entries()) {
                    for (const [, value] of Object.values(media).entries())
                    if (value === null || value === undefined || value === `placeholder` || value === -1) {
                        throw new Error(`Rejected media validation request. Media contains a null, undefined, placeholer, or -1 value:\n${JSON.stringify(media)}`)
                    }
                }
            }
            return true
        } else {
            return false
        }
    }
}