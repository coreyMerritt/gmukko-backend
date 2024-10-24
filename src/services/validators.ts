import { AnimationFileData, AnimeFileData, InternetFileData, MediaData, MovieFileData, ShowFileData, StandupFileData } from '../interfaces_and_enums/index.js'


export class Validators {

    public static isSomeMediaData(object: object): object is MediaData {
        return 'filePath' in object &&
            'title' in object
    }

    public static isMovieFileData(object: any): object is MovieFileData {
        return 'filePath' in object &&
            'title' in object &&
            'releaseYear' in object
    }
    
    public static isShowFileData(object: any): object is ShowFileData {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isStandupFileData(object: any): object is StandupFileData {
        return 'filePath' in object &&
            'title' in object &&
            'artist' in object &&
            'releaseYear' in object
    }
    
    public static isAnimeFileData(object: any): object is AnimeFileData {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isAnimationFileData(object: any): object is AnimationFileData {
        return 'filePath' in object &&
            'title' in object &&
            'seasonNumber' in object &&
            'episodeNumber' in object
    }
    
    public static isInternetFileData(object: any): object is InternetFileData {
        return 'filePath' in object &&
            'title' in object
    }

    public static isMediaDataArray(objectArray: object[]): objectArray is MediaData[] {
        for (const [i, object] of objectArray.entries()) {
            if (!Validators.isSomeMediaData(object)) {
                return false
            }
        }
        return true
    }
}