import axios, { AxiosInstance } from "axios"
import { FileEngine } from "./file_engine.js"
import axiosRetry from "axios-retry"
import { Paths } from "./configuration.js"
import path from 'path'
import ansiColors from "ansi-colors"


export class AxiosEngine {
    
    private protocol = `http`
    private host = `localhost`
    private port = 3080
    private url = `${this.protocol}://${this.host}:${this.port}`
    private instance = this.createCustomAxios() 


    public async startIndexing(): Promise<void> {
        try {
            const reply = await this.instance.post(`/db/staging/index`)
            console.log(reply.data)
        } catch (error) {
            throw new Error(`Failed to start indexing.`, { cause: error })
        }
    }

    public async startDatabaseBackups(): Promise<void> {
        const reply = await this.instance.post('/db/backup')
        console.log(reply.data)
    }

    public async getMediaPendingValidation(): Promise<object|undefined> {
        try {
            const rawGet = await this.instance.get(`/db/staging/validation/pending`)
            const getData = rawGet.data
            console.log(`${rawGet.status}`)
            return getData
        } catch (error) {
            throw new Error(`Server did not respond to GET.`, { cause: error })
        }
    }

    public async postStagingValidationResults(filePath: Paths): Promise<void> {
        const fileEngine = new FileEngine()
        const validationResults = await fileEngine.readYamlFileToObject(filePath)
        if (validationResults) {
            try {
                const reply = await this.instance.post(`/db/staging/validation/rejected`, validationResults)
                console.log(`${reply.status}: ${reply.data}`)
            } catch (error) {
                throw new Error(`Unable to post ${filePath}`, { cause: error })
            }
        } else {
            console.log(`No staging validation results to post for ${path.basename(filePath)}.`)
        }
    }



    private createCustomAxios(): AxiosInstance {
        try {
            const axiosInstance = axios.create({
                baseURL: this.url,
                timeout: 9999,
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            })
            axiosRetry(axiosInstance, { retries: 9999 })
            return axiosInstance
        } catch (error) {
            throw new Error(`Failed to initiate an axios instance.`, { cause: error })
        }
    }
}