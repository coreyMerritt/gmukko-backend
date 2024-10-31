import { Media, MediaModel } from "../media.js"


export class VideoModel extends MediaModel {
    public videoType!: string
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

    public prepStringForFileName(someString: string): string {
        var newString = someString.toLowerCase().replace(/ /g, '-').replace(`:`, ``).replace(`'`, ``).replace(`;`, "").replace(`"`, ``)
        newString = newString.replace(`?`, ``).replace(`>`, ``).replace(`<`, ``).replace(`\\`, `/`).replace(`|`, ``).replace(`*`, ``)
        return newString
    }
}