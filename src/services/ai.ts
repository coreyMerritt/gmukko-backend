import { GmukkoLogger } from './gmukko_logger.js'
import { Validators } from './validators.js'
import { OpenAI } from 'openai'
import { Prompts } from '../configuration/index.js'
import { Media } from '../media/media.js'
import { MediaFactory } from '../media/media_factory.js'


export class AI {
    
    private model: OpenAI

    constructor() {
        this.model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }

    async evaluate(prompt: Prompts, data: string[]): Promise<string|undefined> {
        GmukkoLogger.info(`Attempting to send a request to the OpenAI API with ${data.length} pieces of data...`)
        try {
            const result = await this.model.chat.completions.create({
                model: `gpt-3.5-turbo-0125`,
                messages: [
                    { role: `system`, content: prompt},
                    { role: 'user', content: data.toString()}
                ],
                max_tokens: 3500,
                temperature: 0,
                presence_penalty: -2
            })
            if (result.choices[0].message.content) {
                GmukkoLogger.info(`Successfully recieved a response from the OpenAI API.`)
                return result.choices[0].message.content
            } else {
                GmukkoLogger.invalidJsonArray(prompt, data, "NULL")
                GmukkoLogger.info(`OpenAI API returned null.`)
                return undefined
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to recieve a response from the OpenAI API.\n`, error)
            return undefined
        }
    }



    public static async parseAllMediaData(filePaths: string[], prompt: Prompts): Promise<Media[]> {
        // This structure is to optimize token usage on OpenAI API calls.
        GmukkoLogger.info(`Attempting to parse ${filePaths.length} file paths.`)
        var videoFiles: Media[] = [] 
        var workingArray: string[] = []
        for (const [i, filePath] of filePaths.entries()) {
            workingArray.push(filePath)
            if (((i+1) % 30) === 0) {
                GmukkoLogger.info(`Attempting to parse files ${i-28}-${i+1} of ${filePaths.length}.`)
                const tenVideoFiles = await this.parseSomeMediaData(workingArray, prompt)
                if (tenVideoFiles) {
                    videoFiles = videoFiles.concat(tenVideoFiles)
                }
                workingArray = []
            } else if (i+1 === filePaths.length) {
                GmukkoLogger.info(`Attempting to parse files ${(Math.floor(i/30)*30)+1}-${i+1} of ${filePaths.length}.`)
                const upToNineVideoFiles = await this.parseSomeMediaData(workingArray, prompt)
                if (upToNineVideoFiles) {
                    videoFiles = videoFiles.concat(upToNineVideoFiles)
                }
            }
        }
        GmukkoLogger.info(`Finished parsing ${filePaths.length} file paths.`)
        return videoFiles
    }


    public static async parseSomeMediaData(filePaths: string[], prompt: Prompts): Promise<Media[]|undefined> {
        try {
            const ai = new AI()
            const aiResult = await ai.evaluate(prompt, filePaths)
            if (aiResult) {
                const jsonArray = await this.stringToJsonArray(aiResult, prompt, filePaths)
                if (jsonArray) {
                    if (Validators.isMediaArray(jsonArray)) {
                        var media = []
                        for (const [, object] of jsonArray.entries()) {
                            media.push(MediaFactory.createMedia(object))
                        }
                        return media
                    } else {
                        GmukkoLogger.invalidVideoData(jsonArray)
                        return undefined
                    }
                } else {
                    GmukkoLogger.error(`Unable to parse the result as a JSON array.`)
                    return []
                }
            } else {
                GmukkoLogger.error(`Failed to parse filePaths. AI returned an empty result.`)
                return []
            }
        } catch (error) {
            GmukkoLogger.error(`Failed to parse ${filePaths.length} files.`, error)
            return []
        }
    }


    private static async stringToJsonArray(someString: string, prompt: Prompts, data: string[]): Promise<object[]|undefined> {
        const jsonArrayAsString = await this.stringToJsonArrayString(someString)
        if (jsonArrayAsString) {
            return JSON.parse(jsonArrayAsString)
        } else {
            GmukkoLogger.invalidJsonArray(prompt, data, someString)
            return undefined
        }
    }

    public static async stringToJsonArrayString(someString: string): Promise<string|undefined> {
        const jsonArrayRegex = /\[(\s*{[\s\S]*?}\s*,?\s*)+\]/g
        var match

        while ((match = jsonArrayRegex.exec(someString)) !== null) {
            const potentialArray = match[0]

            try {
                const parsedArray = JSON.parse(potentialArray)

                if (Array.isArray(parsedArray) && parsedArray.some(item => typeof item === 'object')) {
                    return potentialArray
                }
            } catch (error) {
                continue
            }
        }

        return undefined
    }
}