import axios, { AxiosInstance } from "axios"
import { FileEngine } from "./file_engine.js"
import { Menus } from "./menus.js"
import yaml from 'yaml'
import axiosRetry from "axios-retry"
import http from 'http'


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
            console.error(`Failed to start indexing.`, error)
        }
    }

    public async getPendingStagingMedia(): Promise<object|undefined> {
        try {
            const rawGet = await this.instance.get(`/db/staging/validation/pending`)
            const getData = rawGet.data
            console.log(rawGet.status)
            return getData
        } catch {
            console.error(`Server did not respond to GET.`)
        }
    }

    public async postAcceptedStagingMedia() {
        const fileEngine = new FileEngine()
        const acceptedMedia = await fileEngine.readAcceptedMedia()
        if (acceptedMedia) {
            try {
                const reply = await this.instance.post(`/db/staging/validation/accepted`, acceptedMedia)
                console.log(`${reply.status}: ${reply.data}`)
            } catch {
                console.error(`Unable to post accepted staging media results:\n${yaml.stringify(acceptedMedia)}`)
            }
        } else {
            console.log(`No accepted media to post.`)
        }
    }

    public async postRejectedStagingMedia() {
        const fileEngine = new FileEngine()
        const rejectedMedia = await fileEngine.readRejectedMedia()
        if (rejectedMedia) {
            try {
                const reply = await this.instance.post(`/db/staging/validation/rejected`, rejectedMedia)
                console.log(`${reply.status}: ${reply.data}`)
            } catch {
                console.error(`Unable to post rejected staging media results:\n${yaml.stringify(rejectedMedia)}`)
            }
        } else {
            console.log(`No rejected media to post.`)
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