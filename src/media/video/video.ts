import { Model } from "sequelize"
import { Media, MediaTypes } from "../media.js"

export class VideoModel extends Model {
    public filePath!: string
    public title!: string
}

export abstract class Video extends Media {
    public mediaType = MediaTypes.Video
    public fileExtensions = [ '.mkv', '.avi', '.mp4', '.mov' ]
    public abstract videoType: VideoTypes
}

export enum VideoTypes {
    Animation = 'animation',
    Anime = 'anime',
    Misc = 'misc_video',
    Movie = 'movie',
    Show = 'show',
    Standup = 'standup'
}