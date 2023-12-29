const tmx = require('tmx-parser')

async function loadMap(){
    const map = await new Promise((resolve, reject) => {
        tmx.parseFile('./src/map.tmx', (err, loadedMap)=>{
            if(err) return reject(err)
            resolve(loadedMap)
        })
    })
    
    const layer = map.layers[0]
    const tiles = layer.tiles

    const map2D = []
    
    for(let row = 0; row < map.height; row++){
        const tileRow = []
        for(let col = 0; col < map.width; col++){
            let tile = tiles[row * map.height + col]
            try{
                tileRow.push({
                id: tile.id, 
                gid: tile.gid
            })
            } catch (error) {
                console.log("HIBA");
                console.log(`${row}|${col}`);
            }
        }
        map2D.push(tileRow)
    }

    return map2D
}

module.exports = loadMap