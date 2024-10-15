import http from 'http'
import fs from 'fs'
import express from 'express'

const app = express()

app.get('/', (req, res) => {
    res.json({ message: 'Hello, Secure World!' })
});

app.use((req, res, next) => {
    console.log(`Request received: 
        Method: ${req.method}, 
        URL: ${req.url}, 
        Headers: ${JSON.stringify(req.headers, null, 2)}, 
        IP: ${req.socket.remoteAddress}, 
        User-Agent: ${req.headers['user-agent']}, 
        Timestamp: ${new Date().toISOString()}`)
    next()
});

const server = http.createServer(app)

const port = 3080
server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`)
})

