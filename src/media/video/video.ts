import { Model } from "sequelize"
import { Media, MediaTypes } from "../media.js"

export class VideoModel extends Model {
    public filePath!: string
    public title!: string
}

export abstract class Video extends Media {
    public static readonly mediaType = MediaTypes.Video
    public static readonly videoType: VideoTypes
    public static readonly extensions = [ '.mkv', '.avi', '.mp4', '.mov' ]

    getVideoType() {
        return (this.constructor as typeof Video).videoType
    }
}

export enum VideoTypes {
    Animation = 'animation',
    Anime = 'anime',
    Misc = 'misc_video',
    Movie = 'movie',
    Show = 'show',
    Standup = 'standup'
}