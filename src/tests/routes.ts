import axios from "axios"
import { Start } from '../startup/start.js'


export class TestRoutes {

    public static testAll() {

    }

    public static testBackups() {
        this.testBackupAll()
    }

    public static testBackupAll(): boolean {
        const result = axios.post(`${Start.url}/backup`)
        return true
    }
}