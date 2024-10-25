import { AI, Database, GmukkoLogger, MediaHandler, Validators } from '../core/index.js'
import { Animation, Anime, MiscVideo, Movie, Show, Standup, Video, VideoFactory, VideoTypes } from '../media/video/index.js'
import { Prompt } from '../configuration/index.js'
import { StagingPaths } from '../configuration/staging.js'
import { Media, MediaTypes } from '../media/media.js'

export class MediaController {

    public static async indexStaging(videoType: string | undefined) {
        if (videoType === undefined) {
            this.indexAllStagingDirectories()
        } else if (Validators.isVideoType(videoType)) {
            const nullVideo = VideoFactory.createVideoFromVideoType(videoType)
            this.indexOneStagingDirectory(nullVideo)
        } else {
            throw new Error(`Parameter passed was invalid.`)
        }
    }


    private static async indexAllStagingDirectories() {
        var stagingDirectory: StagingPaths,
            fileExtensions: string[],
            prompt: Prompt
        
            const nullAnimation = new Animation("")
            this.indexOneStagingDirectory(nullAnimation)

            const nullAnime = new Anime("")
            this.indexOneStagingDirectory(nullAnime)

            const nullMovie = new Movie("")
            this.indexOneStagingDirectory(nullMovie)

            const nullShow = new Show("")
            this.indexOneStagingDirectory(nullShow)

            const nullStandup = new Standup("")
            this.indexOneStagingDirectory(nullStandup)

            const nullMiscVideo = new MiscVideo("")
            this.indexOneStagingDirectory(nullMiscVideo)
    }


    private static async indexOneStagingDirectory(nullMedia: Media) {
        const filePaths = await MediaHandler.getFilePaths(nullMedia.stagingDirectory, nullMedia.fileExtensions)
        if (filePaths.length > 0) {
            const media = await AI.parseAllMediaData(filePaths, nullMedia.prompt)
            if (media.length > 0) {
                await Database.indexMedia(media)
            } else {
                GmukkoLogger.info(`No files to index.`)
            }
        } else {
            GmukkoLogger.info(`No files to index.`)
        }
    }
}