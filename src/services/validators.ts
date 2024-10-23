import { AnimationFileData, AnimeFileData, InternetFileData, MediaFileData, MovieFileData, ShowFileData, StandupFileData } from '../interfaces_and_enums/video_file_data_types.js'

export default class Validators {

    public static isSomeMediaFileData(object: object): object is MediaFileData {
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
            'artist' in object
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

    public static isMediaDataArray(objectArray: object[]): objectArray is MediaFileData[] {
        for (const [i, object] of objectArray.entries()) {
            if (!Validators.isSomeMediaFileData(object)) {
                return false
            }
        }
        return true
    }
}