import http from 'http'
import express from 'express'
import apiRoutes from './api/api.js'
import filedataRoutes from './api/filedata.js'
import mediaRefreshRoutes from './api/media/refresh/index.js'

const app = express()
const server = http.createServer(app)
const port = 3080

server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`)
})

app.use((req, res, next) => {
    console.log(`\n\nRequest received:\n` +
        `\tTimestamp: ${new Date().toISOString()}\n` +
        `\tURL: ${req.url}\n` +
        `\tMethod: ${req.method}\n` +
        `\tIP: ${req.socket.remoteAddress}\n` +
        `\tUser-Agent: ${req.headers['user-agent']}\n` +
        `\tHeaders: ${JSON.stringify(req.headers, null, 2)}\n`)
    next()
})

app.use('/', apiRoutes)
app.use('/', filedataRoutes)
app.use('/media/refresh', mediaRefreshRoutes)