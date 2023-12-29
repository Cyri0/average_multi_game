const express = require('express')

const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer)

const loadMap = require('./mapLoader')

async function main(){

    const map2D = await loadMap()

    console.log(map2D);

    io.on('connect', (socket) => {
        console.log(`user connected: ${socket.id}`)
        io.emit('map', map2D)
    })
    
    app.use(express.static("public"))
    
    httpServer.listen(5000)
}

main()

