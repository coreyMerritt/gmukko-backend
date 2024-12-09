import axios, { AxiosInstance } from "axios"
import { FileEngine } from "./file_engine.js"
import axiosRetry from "axios-retry"
import { Paths } from "./configuration.js"
import path from 'path'


export class AxiosEngine {
    
    private protocol = `http`
    private host = `localhost`
    private port = process.env.LIKI_PORT
    private url = `${this.protocol}://${this.host}:${this.port}`
    private instance = this.createCustomAxios() 


    public async startIndexing(): Promise<void> {
        try {
            const reply = await this.instance.post(`/index/staging`)
            console.log(reply.data)
        } catch (error) {
            throw new Error(`Failed to start indexing.`, { cause: error })
        }
    }

    public async startDatabaseBackups(): Promise<void> {
        const reply = await this.instance.post('/backup')
        console.log(reply.data)
    }

    public async getMediaPendingValidation(): Promise<object> {
        try {
            const rawGet = await this.instance.get(`/validation/pending`)
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
        if (!validationResults) {
            console.warn(`No staging validation results to post for ${path.basename(filePath)}, trying anyway...`)
        }
        try {
            if (filePath === Paths.AcceptedValidation) {
                const reply = await this.instance.post(`/validation/accepted`, validationResults)
                console.log(`${reply.status}: ${reply.data}`)
            } else {
                const reply = await this.instance.post(`/validation/rejected`, validationResults)
                console.log(`${reply.status}: ${reply.data}`)
            }
        } catch (error) {
            throw new Error(`Unable to post ${filePath}`, { cause: error })
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