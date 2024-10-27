import { Model } from "sequelize"
import { Media, MediaTypes } from "../media.js"

export class VideoModel extends Model {
    public filePath!: string
    public title!: string
}

export enum VideoTypes {
    Animation = 'animation',
    Anime = 'anime',
    Misc = 'misc_video',
    Movie = 'movie',
    Show = 'show',
    Standup = 'standup'
}

export abstract class Video extends Media {
    public abstract videoType: VideoTypes

    public getFileExtensions() {
        return [ '.mkv', '.avi', '.mp4', '.mov' ]
    }
}