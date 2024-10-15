import http from 'http'
import express from 'express'
import apiRoutes from './api/api.js'
import filedataRoutes from './api/filedata.js'

const app = express()
const server = http.createServer(app)
const port = 3080

server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`)
})

app.use((req, res, next) => {
    console.log(`Request received: 
        Method: ${req.method}, 
        URL: ${req.url}, 
        Headers: ${JSON.stringify(req.headers, null, 2)}, 
        IP: ${req.socket.remoteAddress}, 
        User-Agent: ${req.headers['user-agent']}, 
        Timestamp: ${new Date().toISOString()}`)
    next()
})

app.use('/', apiRoutes)
app.use('/', filedataRoutes)