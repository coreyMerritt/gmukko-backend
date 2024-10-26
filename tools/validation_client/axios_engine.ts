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
    private url = `${this.protocol}://${this.host}:${this.port}/db/staging/validation/`

    private instance = this.createCustomAxios() 


    public async getPendingStagingMedia(): Promise<object|undefined> {
        try {
            const rawGet = await this.instance.get(`pending`)
            const getData = rawGet.data
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
                await this.instance.post(`accepted`, acceptedMedia)
                console.log(`Posted accepted staging media results.`)
            } catch {
                console.error(`Unable to post accepted staging media results:\n${yaml.stringify(acceptedMedia)}`)
            }
        } else {
            console.log(`No accepted media to post.`)
        }
        new Menus().main()
    }

    public async postRejectedStagingMedia() {
        const fileEngine = new FileEngine()
        const rejectedMedia = await fileEngine.readRejectedMedia()
        if (rejectedMedia) {
            try {
                await this.instance.post(`rejected`, rejectedMedia)
                console.log(`Posted rejected staging media results.`)
            } catch {
                console.error(`Unable to post rejected staging media results:\n${yaml.stringify(rejectedMedia)}`)
            }
        } else {
            console.log(`No rejected media to post.`)
        }
        new Menus().main()
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