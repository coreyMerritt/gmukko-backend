import http from 'http'
import express from 'express'
import apiRoutes from './api/api.js'
import filedataRoutes from './api/filedata.js'
import mediaRefreshRoutes from './api/media/refresh/index.js'
import Startup from './services/startup.js'
import GmukkoLogger from './services/gmukko_logger.js'

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

app.use('/', apiRoutes)
app.use('/', filedataRoutes)
app.use('/media/refresh', mediaRefreshRoutes)