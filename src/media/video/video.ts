import { Model } from "sequelize"
import { Media } from "../media.js"

export class VideoModel extends Model {
    public mediaType!: string
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

    public getFileExtensions(): string[] {
        return ['.mkv', '.avi', '.mp4', '.mov']
    }
}