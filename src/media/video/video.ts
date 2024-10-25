import { Media, MediaTypes } from "../media.js"

export abstract class Video extends Media {
    public static readonly mediaType = MediaTypes.Video
    public static readonly extensions = [ '.mkv', '.avi', '.mp4', '.mov' ]
}

export enum VideoTypes {
    Animation = 'animation',
    Anime = 'anime',
    Misc = 'misc_video',
    Movie = 'movie',
    Show = 'show',
    Standup = 'standup'
}