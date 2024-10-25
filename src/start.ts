import { GmukkoLogger, Startup } from './core/index.js'
import http from 'http'
import express from 'express'
import initialIndexRoutes from './api/db/staging/index/routes.js'
import dbBackupRoutes from './api/db/backup/routes.js'


Startup.execute()
const app = express()
const server = http.createServer(app)
const port = 3080

server.listen(port, () => {
    GmukkoLogger.info(`Server is running on https://localhost:${port}`)
})

app.use((req, res, next) => {
    GmukkoLogger.incomingRequest(req)
    next()
})

app.use(`/db/staging/index`, initialIndexRoutes)
app.use(`/db/backup`, dbBackupRoutes)