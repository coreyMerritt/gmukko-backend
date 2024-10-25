import { Media, MediaTypes } from '../media/media.js'
import { Anime, Animation, MiscVideo, Movie, Show, Standup, Video, VideoTypes } from '../media/video/index.js'


export class Validators {
   
    public static isMedia(object: object): object is Media {
        return 'mediaType' in object &&
            'filePath' in object &&
            'title' in object
    }

    public static isVideo(object: object): object is Video {
        return 'filePath' in object &&
            'title' in object
    }

    public static isMovie(object: any): object is Movie {
        return 'filePath' in object &&
            'title' in object &&
            'releaseYear' in object
    }
    
    public static isShow(object: any): object is Show {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isStandup(object: any): object is Standup {
        return 'filePath' in object &&
            'title' in object &&
            'artist' in object &&
            'releaseYear' in object
    }
    
    public static isAnime(object: any): object is Anime {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isAnimation(object: any): object is Animation {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isMiscVideo(object: any): object is MiscVideo {
        return 'filePath' in object &&
            'title' in object
    }

    public static isMediaArray(objectArray: object[]): objectArray is Media[] {
        for (const [i, object] of objectArray.entries()) {
            if (!Validators.isMedia(object)) {
                return false
            }
        }
        return true
    }

    public static isVideoArray(objectArray: object[]): objectArray is Video[] {
        for (const [i, object] of objectArray.entries()) {
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
}