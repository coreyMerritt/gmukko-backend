import { AnimationData, AnimeData, InternetData, VideoData, MovieData, ShowData, StandupData } from '../interfaces_and_enums/index.js'


export class Validators {

    public static isVideoData(object: object): object is VideoData {
        return 'filePath' in object &&
            'title' in object
    }

    public static isMovieData(object: any): object is MovieData {
        return 'filePath' in object &&
            'title' in object &&
            'releaseYear' in object
    }
    
    public static isShowData(object: any): object is ShowData {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isStandupData(object: any): object is StandupData {
        return 'filePath' in object &&
            'title' in object &&
            'artist' in object &&
            'releaseYear' in object
    }
    
    public static isAnimeData(object: any): object is AnimeData {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isAnimationData(object: any): object is AnimationData {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isInternetData(object: any): object is InternetData {
        return 'filePath' in object &&
            'title' in object
    }

    public static isVideoDataArray(objectArray: object[]): objectArray is VideoData[] {
        for (const [i, object] of objectArray.entries()) {
            if (!Validators.isVideoData(object)) {
                return false
            }
        }
        return true
    }
}