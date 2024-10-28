import { GmukkoLogger } from './gmukko_logger.js'
import { Validators } from './validators.js'
import { OpenAI } from 'openai'
import { Prompt } from '../configuration/index.js'
import { Media } from '../media/media.js'
import { MediaFactory } from '../media/media_factory.js'


export class AI {
    
    private model: OpenAI

    constructor() {
        this.model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }

    async evaluate(prompt: string, data: string[]): Promise<string> {
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
                return result.choices[0].message.content
            } else {
                throw new Error(`OpenAI API returned null.`)
            }
        } catch (error) {
            throw new Error(`Failed to recieve a response from the OpenAI API.\n`, { cause: error })
        }
    }



    public static async parseAllMediaData(filePaths: string[], prompt: Prompt): Promise<Media[]> {
        // This structure is to optimize token usage on OpenAI API calls.
        var videoFiles: Media[] = [] 
        var workingArray: string[] = []
        for (const [i, filePath] of filePaths.entries()) {
            workingArray.push(filePath)
            if (((i+1) % 30) === 0) {
                GmukkoLogger.info(`Attempting to parse files ${i-28}-${i+1} of ${filePaths.length}...`)
                const tenVideoFiles = await this.parseSomeMediaData(workingArray, prompt)
                if (tenVideoFiles) {
                    videoFiles = videoFiles.concat(tenVideoFiles)
                }
                workingArray = []
            } else if (i+1 === filePaths.length) {
                GmukkoLogger.info(`Attempting to parse files ${(Math.floor(i/30)*30)+1}-${i+1} of ${filePaths.length}...`)
                const upToNineVideoFiles = await this.parseSomeMediaData(workingArray, prompt)
                if (upToNineVideoFiles) {
                    videoFiles = videoFiles.concat(upToNineVideoFiles)
                }
            }
        }
        return videoFiles
    }


    public static async parseSomeMediaData(filePaths: string[], prompt: Prompt): Promise<Media[]> {
        try {
            const ai = new AI()
            const aiResult = await ai.evaluate(prompt.value, filePaths)
            if (aiResult) {
                const jsonArray = await this.stringToObjectArray(aiResult)
                if (jsonArray) {
                    if (Validators.isMediaArray(jsonArray)) {
                        var media = []
                        for (const [, object] of jsonArray.entries()) {
                            const objectAsMedia = MediaFactory.createMedia(object)
                            if (objectAsMedia) {
                                media.push(objectAsMedia)
                            }
                        }
                        return media
                    } else {
                        throw new Error(`JSON array is not a Media array.`)
                    }
                } else {
                    throw new Error(`Unable to parse OpenAI's result as a JSON array.`)
                }
            } else {
                throw new Error(`Failed to parse filePaths. OpenAI returned an empty result.`)
            }
        } catch (error) {
            throw new Error(`Failed to parse ${filePaths.length} files.`, { cause: error })
        }
    }


    private static async stringToObjectArray(someString: string): Promise<object[]> {
        try {
            const arrayAsString = await this.stringToJsonArrayString(someString)
            const arrayAsObject = JSON.parse(arrayAsString)
            return arrayAsObject
        } catch (error) {
            throw new Error(`Unable to convert string to object.`, { cause: error })
        }
    }

    public static async stringToJsonArrayString(someString: string): Promise<string> {
        try {
            const jsonArrayRegex = /\[(\s*{[\s\S]*?}\s*,?\s*)+\]/g
            var match: any
            var potentialArray: any
            
            while ((match = jsonArrayRegex.exec(someString)) !== null) {
                potentialArray = match[0]

                try {
                    const parsedArray = JSON.parse(potentialArray)

                    if (Array.isArray(parsedArray) && parsedArray.some(item => typeof item === 'object')) {
                        return potentialArray
                    }
                } catch {
                    continue
                }   
            }

            // Shouldn't be possible to make it this far, but this makes typescript happy.
            return potentialArray

        } catch (error) {
            throw new Error(`Unable to parse string as a JSON string.`, { cause: error })
        }
    }
}