import { AI, Database, GmukkoLogger, Validators } from '../core/index.js'
import { Animation, Anime, MiscVideo, Movie, Show, Standup, VideoFactory, VideoTypes } from '../media/video/index.js'
import { DatabaseNames, DatabaseTableNames } from '../configuration/index.js'
import { Media } from '../media/media.js'
import { CoreDirectories } from '../configuration/index.js'
import path from 'path'
import fs from 'fs'

interface TableRequest {
    [tableName: string]: Media[]
}

export interface ValidationRequest {
    tables: TableRequest
}

export class MediaController {

    public static async moveStagingFilesToProduction(validationRequest: ValidationRequest) {
        for (const [, tableName] of Object.keys(validationRequest.tables).entries()) {
            for (const [, media] of validationRequest.tables[tableName].entries()) {
                const newFilePath = await this.getNewFilePathFromMedia(media, tableName as DatabaseTableNames)
                if (newFilePath) {
                    try {
                        fs.mkdirSync(path.dirname(newFilePath), { recursive: true })
                    } catch (error) {
                        throw new Error(`Unable to make directories for new file.\nStaging: ${media.filePath}\nProduction: ${newFilePath}\n${error}`)
                    }
                    
                    try {
                        fs.accessSync(media.filePath)
                    } catch (error) {
                        throw new Error(`Unable to access file.\nerror`)
                    }

                    try {
                        fs.renameSync(media.filePath, newFilePath)
                        media.filePath = newFilePath
                    } catch (error) {
                        throw new Error(`Unable to rename file.\n${error}`)
                    }

                } else {
                    GmukkoLogger.error(`Unable to determine new file path.`)
                }
            }
        }
        GmukkoLogger.info(`Successfully moved file from staging to production.`)
        return validationRequest
    }

    public static async indexStaging(videoType: string | undefined) {
        if (videoType === undefined) {
            this.indexAllStagingDirectories()
        } else if (Validators.isVideoType(videoType)) {
            const nullVideo = VideoFactory.createNullFromVideoType(videoType)
            this.indexOneStagingDirectory(nullVideo)
        } else {
            throw new Error(`Parameter passed was invalid.`)
        }
    }


    public static async getStagingMedia(): Promise<ValidationRequest> {
        var validationRequest: ValidationRequest = { tables: {} }
        
        for (const [, tableName] of Object.values(DatabaseTableNames).entries()) {
            validationRequest.tables[tableName] = []
            const results = await Database.selectAllFromTable(DatabaseNames.Staging, tableName)
            if (results) {
                for (const [, media] of results.entries()) {
                    if (Validators.isMedia(media)) {
                        validationRequest.tables[tableName].push(media)
                    }
                }
            }
        }

        return validationRequest
    }

    private static async getNewFilePathFromMedia(media: Media, tableName: DatabaseTableNames) {
        var newBasePath = `${CoreDirectories.ProductionVideos}/${tableName}`
        var currentFileExtension = path.extname(media.filePath)
        var title = 'title' in media ? media.title.toLowerCase().replace(/ /g, '-') : undefined
        var artist = 'artist' in media ? String(media.artist).toLowerCase().replace(/ /g, '-') : undefined
        var seasonNumber = 'seasonNumber' in media ? String(media.seasonNumber).padStart(2, '0') : undefined
        var episodeNumber = 'episodeNumber' in media ? String(media.episodeNumber).padStart(2, '0') : undefined

        switch (tableName) {
            case DatabaseTableNames.Animation:
                if (Validators.isAnimation(media)) {
                    return `${newBasePath}/${(title)}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
                } else {
                    GmukkoLogger.error(`Media sent to production under table ${tableName} is not actually an animation.`)
                }
                break
            case DatabaseTableNames.Anime:
                if (Validators.isAnime(media)) {
                    return `${newBasePath}/${(title)}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
                } else {
                    GmukkoLogger.error(`Media sent to production under table ${tableName} is not actually an anime.`)
                }
                break
            case DatabaseTableNames.Movies:
                if (Validators.isMovie(media)) {
                    return `${newBasePath}/(${media.releaseYear})-${title}${currentFileExtension}`
                } else {
                    GmukkoLogger.error(`Media sent to production under table ${tableName} is not actually a movie.`)
                }
                break
            case DatabaseTableNames.Shows:
                if (Validators.isShow(media)) {
                    return `${newBasePath}/${(title)}/s${seasonNumber}e${episodeNumber}${currentFileExtension}`
                } else {
                    GmukkoLogger.error(`Media sent to production under table ${tableName} is not actually a show.`)
                }
                break
            case DatabaseTableNames.Standup:
                if (Validators.isStandup(media)) {
                    return `${newBasePath}/${artist}/(${media.releaseYear})-${title}${currentFileExtension}`
                } else {
                    GmukkoLogger.error(`Media sent to production under table ${tableName} is not actually standup.`)
                }
                break
            default:
                if (Validators.isMiscVideo(media)) {
                    return `${newBasePath}/${title}${currentFileExtension}`
                } else {
                    GmukkoLogger.error(`Media sent to production under table ${tableName} is not actually a misc video.`)
                }
                break
            
        }
    }

    private static async indexAllStagingDirectories() {  
            const nullAnimation = VideoFactory.createNullFromVideoType(VideoTypes.Animation)
            this.indexOneStagingDirectory(nullAnimation)

            const nullAnime = VideoFactory.createNullFromVideoType(VideoTypes.Anime)
            this.indexOneStagingDirectory(nullAnime)

            const nullMovie = VideoFactory.createNullFromVideoType(VideoTypes.Movie)
            this.indexOneStagingDirectory(nullMovie)

            const nullShow = VideoFactory.createNullFromVideoType(VideoTypes.Show)
            this.indexOneStagingDirectory(nullShow)

            const nullStandup = VideoFactory.createNullFromVideoType(VideoTypes.Standup)
            this.indexOneStagingDirectory(nullStandup)

            const nullMiscVideo = VideoFactory.createNullFromVideoType(VideoTypes.Misc)
            this.indexOneStagingDirectory(nullMiscVideo)
    }


    private static async indexOneStagingDirectory(nullMedia: Media) {
        const filePaths = await this.getFilePaths(nullMedia.getStagingDirectory(), nullMedia.getFileExtensions())
        if (filePaths.length > 0) {
            const media = await AI.parseAllMediaData(filePaths, nullMedia.getPrompt())
            if (media.length > 0) {
                await Database.indexMedia(media)
            } else {
                GmukkoLogger.info(`No files to index.`)
            }
        } else {
            GmukkoLogger.info(`No files to index.`)
        }
    }

    public static async getFilePaths(directoryToCheck: string, extensionsToMatch: string[]) {
        GmukkoLogger.info(`Attempting to get video file paths from filesystem.`)
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        for (const [i, filePath] of files.entries()) {
            GmukkoLogger.info(`Checking file #${i}: ${filePath}`)
            const fullPath = path.join(directoryToCheck, filePath)
            const fileExtension = path.extname(filePath)
            const stats = fs.statSync(fullPath)
            
            if (stats.isDirectory()) {
                const nestedFiles = await this.getMediaRecursively(fullPath, extensionsToMatch)
                filesMatchingExtension = filesMatchingExtension.concat(nestedFiles)
            } else {
                const isProperFileExtension = extensionsToMatch.some(extensionToMatch => extensionToMatch === fileExtension);
                if (isProperFileExtension) {
                    filesMatchingExtension.push(fullPath)
                    GmukkoLogger.info(`Added file: ${fullPath} to initial indexing.`)
                } else {
                    GmukkoLogger.info(`Ignored file: ${fullPath} from initial indexing.`)
                }
            }
        }

        GmukkoLogger.info(`Succesfully retrieved ${filesMatchingExtension.length} file paths from ${directoryToCheck}.`)
        return filesMatchingExtension
    }

    private static async getMediaRecursively(directoryToCheck: string, extensionsToMatch: string[]): Promise<string[]> {
        GmukkoLogger.info(`Attempting to get video file paths from filesystem.`)
        const files = fs.readdirSync(directoryToCheck)
        var filesMatchingExtension: string[] = []

        for (const [i, filePath] of files.entries()) {
            GmukkoLogger.info(`Checking file #${i}: ${filePath}`)
            const fullPath = path.join(directoryToCheck, filePath)
            const fileExtension = path.extname(filePath)
            const stats = fs.statSync(fullPath)
            
            if (stats.isDirectory()) {
                const nestedFiles = await this.getMediaRecursively(fullPath, extensionsToMatch)
                filesMatchingExtension = filesMatchingExtension.concat(nestedFiles)
            } else {
                const isProperFileExtension = extensionsToMatch.some(extensionToMatch => extensionToMatch === fileExtension);
                if (isProperFileExtension) {
                    filesMatchingExtension.push(fullPath)
                    GmukkoLogger.info(`Added file: ${fullPath} to initial indexing.`)
                } else {
                    GmukkoLogger.info(`Ignored file: ${fullPath} from initial indexing.`)
                }
            }
        }

        GmukkoLogger.info(`Succesfully retrieved ${filesMatchingExtension.length} file paths from ${directoryToCheck}.`)
        return filesMatchingExtension
    }
}