const socket = io(`ws://localhost:5000`)

const mapImage = new Image()
mapImage.src = '/assets/AllAssetsPreview.png'

const skeletonImage = new Image()
skeletonImage.src = '/assets/skeleton_front.png'

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
    canvas.clearRect(0,0,canvas.width, canvas.height)

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
                col * TILE_SIZE,
                row * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            )        
        }
    }


    for(const player of players){
        canvas.drawImage(skeletonImage,player.x,player.y)
    }

    window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)