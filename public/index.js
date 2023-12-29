const socket = io(`ws://localhost:5000`)

socket.on('connect', ()=>{
    console.log("connected")
})

socket.on('map', (map)=>{console.log(map);})