import { AI, Database, GmukkoLogger, MediaHandler } from '../services/index.js'
import { Animation, Anime, MiscVideo, Movie, Show, Standup, Video } from '../media/video/index.js'
import { Prompts } from '../configuration/index.js'
import { StagingPaths } from '../configuration/staging.js'

export class MediaController {

    public static async indexStaging(mediaType: string | undefined) {
        if (mediaType === undefined) {
            this.indexAllStagingDirectories()
        } else {
            const stagingDirectory = await this.determineStagingDirectory(mediaType)
            const fileExtensions = await this.determineFileExtensions(mediaType)
            const prompt = await this.determinePrompt(mediaType)
            this.indexOneStagingDirectory(stagingDirectory, fileExtensions, prompt)
        }
    }


    private static async indexAllStagingDirectories() {
        var stagingDirectory: StagingPaths,
            fileExtensions: string[],
            prompt: Prompts
        
            fileExtensions = Video.extensions

            stagingDirectory = Animation.stagingDir
            prompt = Prompts.ReturnAnimationAsJson
            this.indexOneStagingDirectory(stagingDirectory, fileExtensions, prompt)

            stagingDirectory = Anime.stagingDir
            prompt = Prompts.ReturnAnimeAsJson
            this.indexOneStagingDirectory(stagingDirectory, fileExtensions, prompt)

            stagingDirectory = Movie.stagingDir
            prompt = Prompts.ReturnMovieAsJson
            this.indexOneStagingDirectory(stagingDirectory, fileExtensions, prompt)

            stagingDirectory = Show.stagingDir
            prompt = Prompts.ReturnShowAsJson
            this.indexOneStagingDirectory(stagingDirectory, fileExtensions, prompt)

            stagingDirectory = Standup.stagingDir
            prompt = Prompts.ReturnStandupAsJson
            this.indexOneStagingDirectory(stagingDirectory, fileExtensions, prompt)

            stagingDirectory = MiscVideo.stagingDir
            prompt = Prompts.ReturnMiscVideoAsJson
            this.indexOneStagingDirectory(stagingDirectory, fileExtensions, prompt)
    }


    private static async indexOneStagingDirectory(stagingDirectory: StagingPaths, fileExtensions: string[], prompt: Prompts) {
        const filePaths = await MediaHandler.getFilePaths(stagingDirectory, fileExtensions)
        if (filePaths.length > 0) {
            const media = await AI.parseAllMediaData(filePaths, prompt)
            if (media.length > 0) {
                await Database.indexMedia(media)
            } else {
                GmukkoLogger.info(`No files to index.`)
            }
        } else {
            GmukkoLogger.info(`No files to index.`)
        }
    }


    private static async determineStagingDirectory(mediaType: string) {
        switch (mediaType) {
            case Animation.videoType:
                return Animation.stagingDir
            case Anime.videoType:
                return Anime.stagingDir
            case Movie.videoType:
                return Movie.stagingDir
            case Show.videoType:
                return Show.stagingDir
            case Standup.videoType:
                return Standup.stagingDir
            default:
                return MiscVideo.stagingDir
        }
    }

    private static async determineFileExtensions(mediaType: string) {
        switch (mediaType) {
            case Animation.videoType:
                return Animation.extensions
            case Anime.videoType:
                return Anime.extensions
            case Movie.videoType:
                return Movie.extensions
            case Show.videoType:
                return Show.extensions
            case Standup.videoType:
                return Standup.extensions
            default:
                return MiscVideo.extensions
        }
    }

    private static async determinePrompt(mediaType: string) {
        switch (mediaType) {
            case Animation.videoType:
                return Prompts.ReturnAnimationAsJson
            case Anime.videoType:
                return Prompts.ReturnAnimeAsJson
            case Movie.videoType:
                return Prompts.ReturnMovieAsJson
            case Show.videoType:
                return Prompts.ReturnShowAsJson
            case Standup.videoType:
                return Prompts.ReturnStandupAsJson
            default:
                return Prompts.ReturnMiscVideoAsJson
        }
    }
}