let coordinates = document.getElementById('coordinates')
coordinates.innerText = 'asd'

const socket = io.connect(`ws://192.168.0.137:8000`)

const mapImage = new Image()
mapImage.src = '/assets/AllAssetsPreview.png'

const skeletonImage = new Image()
skeletonImage.src = '/assets/skeleton.png'

const TILE_SIZE = 16
const TILES_IN_ROW = 12

const canvasEl = document.getElementById('canvas')
canvasEl.width = window.innerWidth
canvasEl.height = window.innerHeight

const canvas = canvasEl.getContext("2d")

let map = [[]]
let players = []

socket.on('connect', ()=>{
    console.log("connected")
})

socket.on('map', (loadedMap)=>{
    map = loadedMap
})

socket.on('players', (serverPlayers) => {
    players = serverPlayers
})

const inputs = {
    'up': false,
    'down': false,
    'left': false,
    'right': false,
}

window.addEventListener('keydown', (e)=>{
    const k = e.key.toUpperCase();
    if(k === 'W'){
        inputs['up'] = true
    }
    else if(k === 'A'){
        inputs['left'] = true
    }
    else if(k === 'S'){
        inputs['down'] = true
    }
    else if(k === 'D'){
        inputs['right'] = true
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('keyup', (e)=>{
    const k = e.key.toUpperCase();
    if(k === 'W'){
        inputs['up'] = false
    }
    else if(k === 'A'){
        inputs['left'] = false
    }
    else if(k === 'S'){
        inputs['down'] = false
    }
    else if(k === 'D'){
        inputs['right'] = false
    }
    socket.emit('inputs', inputs)
})

function loop(){
    canvas.clearRect(0,0,canvasEl.width, canvasEl.height)

    const myPlayer = players.find((player) => player.id === socket.id)  
    
    let cameraX = 0
    let cameraY = 0
    
    if(myPlayer){
        coordinates.innerText = `${myPlayer.x}|${myPlayer.y}`
        cameraX = parseInt(myPlayer.x - canvasEl.width / 2)
        cameraY = parseInt(myPlayer.y - canvasEl.height / 2)
    }


    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[0].length; col++) {
            const {id} = map[row][col]
            const imageRow = parseInt(id / TILES_IN_ROW)
            const imageCol = id % TILES_IN_ROW

            canvas.drawImage(
                mapImage,
                imageCol * TILE_SIZE,
                imageRow * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE,
                col * TILE_SIZE - cameraX,
                row * TILE_SIZE - cameraY,
                TILE_SIZE,
                TILE_SIZE
            )        
        }
    }

    drawCharacter(canvas,players, cameraX, cameraY)
    
    window.requestAnimationFrame(loop)
}


function drawCharacter(canvas, players, cameraX, cameraY){
    let offsetX = 0
    let offsetY = 0

    if(inputs['down']){
        offsetY = 0
    }
    else if(inputs['up']){
        offsetY = TILE_SIZE
    }else if(inputs['right']){
        offsetY = 2*TILE_SIZE
    }else if(inputs['left']){
        offsetY = 3*TILE_SIZE
    }

    for(const player of players){
        canvas.drawImage(
            skeletonImage, // image
            offsetX, // sx
            offsetY, // sy
            16, // sWidth
            16, // sHeight
            player.x - cameraX, // dx
            player.y - cameraY, // dy
            16, // sWidth
            16, // dHeight
            )
    }
}

window.requestAnimationFrame(loop)