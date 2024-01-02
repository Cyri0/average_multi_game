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
    'lastDirection': 'down',
    'slash': false
}

let animationList = [0,1,2,3,4]
let animationIndex = 0

window.addEventListener('keydown', (e)=>{
    const k = e.key.toUpperCase();
    if(k === 'W'){
        inputs['up'] = true
        inputs['lastDirection'] = 'up'
    }
    else if(k === 'A'){
        inputs['left'] = true
        inputs['lastDirection'] = 'left'

    }
    else if(k === 'S'){
        inputs['down'] = true
        inputs['lastDirection'] = 'down'

    }
    else if(k === 'D'){
        inputs['right'] = true
        inputs['lastDirection'] = 'right'

    }else if(k === 'SHIFT'){
        inputs['slash'] = true
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('keyup', (e)=>{
    animationIndex = 0
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
    else if(k === 'SHIFT'){
        inputs['slash'] = false
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

function calculateAnimations(base_tick){
    let offsetX = 0
    let offsetY = 0

    let calculateOffsetX = (animationIndex, base_tick) => {
        return parseInt(animationIndex/base_tick) * TILE_SIZE
    }

    let setAnimationIndex = (animationIndex, base_tick, spreetNumber) => {
        if(animationIndex >= ((spreetNumber - 1)*base_tick))
            return 0
        return animationIndex+1
    }

    if(inputs['slash']){
        console.log('SLASH!');
        if(inputs['lastDirection'] == 'down'){
            offsetY = TILE_SIZE * 4
            offsetX = calculateOffsetX(animationIndex, base_tick)
            animationIndex = setAnimationIndex(animationIndex, base_tick, 4)
        }
        else if(inputs['lastDirection'] == 'up'){
            offsetY = TILE_SIZE * 5
            offsetX = calculateOffsetX(animationIndex, base_tick)
            animationIndex = setAnimationIndex(animationIndex, base_tick, 4)
        }
        else if(inputs['lastDirection'] == 'right'){
            offsetY = TILE_SIZE * 6
            offsetX = calculateOffsetX(animationIndex, base_tick)
            animationIndex = setAnimationIndex(animationIndex, base_tick, 4)
        }
        else if(inputs['lastDirection'] == 'left'){
            offsetY = TILE_SIZE * 7
            offsetX = calculateOffsetX(animationIndex, base_tick)
            animationIndex = setAnimationIndex(animationIndex, base_tick, 4)
        }
    }else{
        if(inputs['down'] || inputs['lastDirection'] == 'down'){
            offsetY = 0
            offsetX = calculateOffsetX(animationIndex, base_tick)
            if(inputs['down'])
                animationIndex = setAnimationIndex(animationIndex, base_tick, 5)
        }
        else if(inputs['up']|| inputs['lastDirection'] == 'up'){
            offsetY = TILE_SIZE
            offsetX = calculateOffsetX(animationIndex, base_tick)
            if(inputs['up'])
                animationIndex = setAnimationIndex(animationIndex, base_tick, 5)
        }else if(inputs['right'] || inputs['lastDirection'] == 'right'){
            offsetY = 2*TILE_SIZE
            offsetX = calculateOffsetX(animationIndex, base_tick)
            if(inputs['right'])
                animationIndex = setAnimationIndex(animationIndex, base_tick, 5)
        }else if(inputs['left'] || inputs['lastDirection'] == 'left'){
            offsetY = 3*TILE_SIZE
            offsetX = calculateOffsetX(animationIndex, base_tick)
            if(inputs['left'])
                animationIndex = setAnimationIndex(animationIndex, base_tick, 5)
        }
    }

    return {offsetX: offsetX, offsetY: offsetY}
}

function drawCharacter(canvas, players, cameraX, cameraY){
    let {offsetX, offsetY} = calculateAnimations(5)

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