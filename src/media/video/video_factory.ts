import { Animation } from './animation.js'
import { Anime } from './anime.js' 
import { MiscVideo } from './misc_video.js' 
import { Movie } from './movie.js' 
import { Show } from './show.js'
import { Standup } from './standup.js'
import { VideoTypes } from './video.js'
import { GmukkoLogger } from '../../services/index.js'

export class VideoFactory {
    public static createVideo(object: any) {
        if (`videoType` in object && `filePath` in object) {
            switch (object.videoType) {
                case VideoTypes.Animation:
                    return new Animation(object.filePath,
                        'title' in object ? object.title : undefined,
                        'seasonNumber' in object ? object.seasonNumber : undefined,
                        'episodeNumber' in object ? object.episodeNumber : undefined
                    )
                case VideoTypes.Anime:
                    return new Anime(object.filePath,
                        'title' in object ? object.title : undefined,
                        'seasonNumber' in object ? object.seasonNumber : undefined,
                        'episodeNumber' in object ? object.episodeNumber : undefined
                    )
                case VideoTypes.Movie:
                    return new Movie(object.filePath,
                        'title' in object ? object.title : undefined,
                        'releaseYear' in object ? object.releaseYear : undefined
                    )
                case VideoTypes.Show:
                    return new Show(object.filePath,
                        'title' in object ? object.title : undefined,
                        'seasonNumber' in object ? object.seasonNumber : undefined,
                        'episodeNumber' in object ? object.episodeNumber : undefined
                    )
                case VideoTypes.Standup:
                    return new Standup(object.filePathsMinusIndexed,
                        'title' in object ? object.title : undefined,
                        'artist' in object ? object.artist : undefined,
                        'releaseYear' in object ? object.releaseYear : undefined
                    )
                default:
                    return new MiscVideo(object.filePath,
                        'title' in object ? object.title : undefined
                    )
            }
        } else {
            GmukkoLogger.error(`Object is not a valid Video: ${JSON.stringify(object)}`)
            return new MiscVideo(object.filePath,
                'title' in object ? object.title : undefined
            )
        }
    }
}