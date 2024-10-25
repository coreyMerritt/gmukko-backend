import { MediaTypes } from "../media/media.js"
import { VideoTypes } from "../media/video/video.js"
import { Validators } from '../services/index.js'


export class Prompts {

    public value: string

    constructor(mediaType: MediaTypes)
    constructor(videoType: VideoTypes)

    constructor(type: MediaTypes | VideoTypes) {
        if (Validators.isMediaType(type)) {
            this.value = this.determinePromptByMediaType(type)
        } else if (Validators.isVideoType(type)) {
            this.value = this.determinePromptByVideoType(type)
        } else {
            throw new Error(`Prompt constructor was not given a valid mediaType.`)
        }
    }

    private determinePromptByMediaType(mediaType: MediaTypes): string {
        switch (true) {
            case (Validators.isVideoType(mediaType)):
                return this.determinePromptByVideoType(mediaType)
            default:
                throw new Error(`Could not determine prompt type because mediaType object is not a valid MediaType.`)
        }
    }

    private determinePromptByVideoType(videoType: VideoTypes): string {
        switch (videoType) {
            case VideoTypes.Movie:
                return Prompts.MovieAsJson()
            case VideoTypes.Show:
                return Prompts.ShowAsJson()
            case VideoTypes.Standup:
                return Prompts.StandupAsJson()
            case VideoTypes.Anime:
                return Prompts.AnimeAsJson()
            case VideoTypes.Animation:
                return Prompts.AnimationAsJson()
            case VideoTypes.Misc:
                return Prompts.MiscVideoAsJson()
            default:
                throw new Error(`Could not determine prompt type because videoType object is not a valid VideoType.`)
        }
    }

    private static MovieAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "movie", "filePath": string, "title": string, "releaseYear": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }

    private static ShowAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "show", "filePath": string, "title": string, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'title should reference the title of the show, not the title of the episode.' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'   
    }
    private static StandupAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "standup", "filePath": string, "title": string, "artist": string, "releaseYear": number }, { ... } ]"\n' +
        'Be sure to capitalize titles and artists where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
        
    private static AnimeAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "anime", "filePath": string, "title": string, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
    
    private static AnimationAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "animation", "filePath": string, "title": string, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
    private static MiscVideoAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "misc", "filePath": string, "title": string }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a property you can insert null\n' +
        'Make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
}