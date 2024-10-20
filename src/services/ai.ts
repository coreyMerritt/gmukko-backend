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
            const result = await this.model.completions.create({
                model: 'gpt-3.5-turbo-instruct',
                prompt: `${prompt} ${data.toString()}`,
                max_tokens: 3300,
                temperature: 0,
                echo: false,
                presence_penalty: -2
            })
            console.log(`\tSuccessfully recieved a response from the OpenAI API.`)
            return result.choices[0].text
        } catch (error) {
            console.error(`\tFailed to recieve a response from the OpenAI API.`)
            return undefined
        }
    }
}