import { OpenAI } from 'openai'
import { Prompts } from '../interfaces_and_enums/prompts.js'

export default class AI {
    
    private model: OpenAI

    constructor() {
        this.model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }

    async evaluate(prompt: Prompts, data: string[]): Promise<string|undefined> {
        console.log(`Attempting to send a request to the OpenAI API with ${data.length} pieces of data...`)
        try {
            const result = await this.model.chat.completions.create({
                model: `gpt-3.5-turbo-0125`,
                messages: [
                    { role: `system`, content: prompt},
                    { role: 'user', content: data.toString()}
                ],
                max_tokens: 3300,
                temperature: 0,
                presence_penalty: -2
            })
            if (result.choices[0].message.content) {
                console.log(`\tSuccessfully recieved a response from the OpenAI API.`)
                return result.choices[0].message.content
            } else {
                console.error(`\tOpenAI API returned null.`)
                return undefined
            }
        } catch (error) {
            console.error(`\tFailed to recieve a response from the OpenAI API.\n`, error)
            return undefined
        }
    }
}