import axios, { AxiosInstance } from "axios"
import { FileEngine } from "./file_engine.js"
import { Menus } from "./menus.js"
import yaml from 'yaml'
import axiosRetry from "axios-retry"
import http from 'http'
import { Paths } from "./configuration.js"


export class AxiosEngine {
    
    private protocol = `http`
    private host = `localhost`
    private port = 3080
    private url = `${this.protocol}://${this.host}:${this.port}`
    private instance = this.createCustomAxios() 


    public async startIndexing() {
        try {
            const reply = await this.instance.post(`/db/staging/index`)
            console.log(`${reply.status}: reply.data`)
        } catch (error) {
            throw new Error(`Failed to start indexing.\n${error}`)
        }
    }

    public async getPendingStagingMedia(): Promise<object|undefined> {
        try {
            const rawGet = await this.instance.get(`/db/staging/validation/pending`)
            const getData = rawGet.data
            console.log(rawGet.status)
            return getData
        } catch (error) {
            throw new Error(`Server did not respond to GET.\n${error}`)
        }
    }

    public async postStagingValidationResults(path: Paths) {
        const fileEngine = new FileEngine()
        const validationResults = await fileEngine.readYamlFileToObject(path)
        if (validationResults) {
            try {
                const reply = await this.instance.post(`/db/staging/validation/accepted`, validationResults)
                console.log(`${reply.status}: ${reply.data}`)
            } catch (error) {
                throw new Error(`Unable to post ${path}:\n${error}`)
            }
        } else {
            throw new Error(`No staging validation results to post.`)
        }
    }


    private createCustomAxios(): AxiosInstance {
        const axiosInstance = axios.create({
            baseURL: this.url,
            timeout: 9999,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        })
        axiosRetry(axiosInstance, { retries: 9999 })
        return axiosInstance
    }
}