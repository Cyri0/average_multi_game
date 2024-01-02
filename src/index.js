const express = require('express')
var cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
app.use(cors())
const httpServer = createServer(app)

const io = new Server(httpServer)

const loadMap = require('./mapLoader')

const SPEED = 5
const TICK_RATE = 30

let players = []

const inputsMap = {}

function tick(){
    for (const player of players){
        const inputs = inputsMap[player.id]

        if(inputs.up && player.y > 0){
            if(inputs.right || inputs.left){
                player.y -= parseInt(SPEED / 2)
            }
            else{
                player.y -= SPEED
            }
        }
        else if(inputs.down && player.y < 465){
            if(inputs.right || inputs.left){
                player.y += parseInt(SPEED / 2)
            }
            else{
                player.y += SPEED
            }
        }

        if(inputs.left && player.x > 0){
                player.x -= SPEED
        }
        else if(inputs.right&& player.x < 465){
            player.x += SPEED
        }
    }

    io.emit('players', players)
}

async function main(){

    const map2D = await loadMap()

    io.on('connect', (socket) => {
        console.log(`user connected: ${socket.id}`)
        
        inputsMap[socket.id] = {
            up: false,
            down: false,
            right: false,
            left: false,
            lastDirection: 'down',
            slash: false
        }
        
        players.push({
            id: socket.id,
            x: 185,
            y: 222
        })

        socket.emit('map', map2D)

        socket.on('inputs', (inputs) => {
            inputsMap[socket.id] = inputs
        })

        socket.on('disconnect', ()=>{
            players = players.filter(player => player.id !== socket.id)
        })
    })
    
    app.use(express.static("public"))
    
    httpServer.listen(8000)

    setInterval(tick, 1000 / TICK_RATE)
} 

main()