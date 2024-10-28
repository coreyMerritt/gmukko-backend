import { MediaTypes } from "../media/media.js"
import { VideoTypes } from "../media/video/video.js"
import { Validators } from '../core/index.js'


export class Prompt {

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
                return this.MovieAsJson()
            case VideoTypes.Show:
                return this.ShowAsJson()
            case VideoTypes.Standup:
                return this.StandupAsJson()
            case VideoTypes.Anime:
                return this.AnimeAsJson()
            case VideoTypes.Animation:
                return this.AnimationAsJson()
            case VideoTypes.Misc:
                return this.MiscVideoAsJson()
            default:
                throw new Error(`Could not determine prompt type because videoType object is not a valid VideoType.`)
        }
    }

    private MovieAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "movie", "filePath": string, "title": string, "releaseYear": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a propertys true value do not use NULL, instead use -1 for number values and "placeholder" for string values\n' +
        'Be extremely careful to make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }

    private ShowAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "show", "filePath": string, "title": string, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'title should reference the title of the show, not the title of the episode.' +
        'If you struggle with a propertys true value do not use NULL, instead use -1 for number values and "placeholder" for string values\n' +
        'Be extremely careful to make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'   
    }
    private StandupAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "standup", "filePath": string, "title": string, "artist": string, "releaseYear": number }, { ... } ]"\n' +
        'Be sure to capitalize titles and artists where appropriate.\n' +
        'If you struggle with a propertys true value do not use NULL, instead use -1 for number values and "placeholder" for string values\n' +
        'Be extremely careful to make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
        
    private AnimeAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "anime", "filePath": string, "title": string, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a propertys true value do not use NULL, instead use -1 for number values and "placeholder" for string values\n' +
        'Be extremely careful to make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
    
    private AnimationAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "animation", "filePath": string, "title": string, "seasonNumber": number, "episodeNumber": number }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a propertys true value do not use NULL, instead use -1 for number values and "placeholder" for string values\n' +
        'Be extremely careful to make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
    private MiscVideoAsJson() {
        return 'Return a fully parsable JSON array of objects in this format:\n' +
        '"[ { "mediaType": "video", "videoType": "misc", "filePath": string, "title": string }, { ... } ]"\n' +
        'Be sure to capitalize titles where appropriate.\n' +
        'If you struggle with a propertys true value do not use NULL, instead use -1 for number values and "placeholder" for string values\n' +
        'Be extremely careful to make sure all keys are enclosed in double quotes.\n' +
        'Your answer should be a fully parsable valid JSON array. The object order should correlate with the order of the data given.\n'
    }
}