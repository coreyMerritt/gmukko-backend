import { OpenAI } from 'openai'
import { Prompts } from '../interfaces_and_enums/prompts.js'

export default class AI {
    
    private model: OpenAI

    constructor() {
        this.model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }

    async evaluate(prompt: Prompts, data: string[]): Promise<string> {
        const result = await this.model.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: `${prompt} ${data.toString()}`,
            max_tokens: 3300,
            temperature: 0,
            echo: false,
            presence_penalty: -2
        })

        return result.choices[0].text
    }
}