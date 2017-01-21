var canvas
var context
var slots = []
var lifter
var controller
var observedSlot
var controlledTile
var boundedSlots = [];
var fps = 15
function init() {
    canvas = document.getElementById('canvas')
    context = canvas.getContext('2d') 


    for (let i = 0; i < canvas.width / 100; i++) {
      slots[i] = new Array(Math.floor(Math.random() * 5)).fill({})

      for (let j = 0; j < slots[i].length; j++) {
          let height = Math.floor(Math.random() * 30 + 50)
          let y = j == 0 ? canvas.height - height : slots[i][j - 1].y - height
          slots[i][j] = {
              name: Math.floor(Math.random() * 1000),
              x: i * 100,
              y: y,
              height: height,
              width: 100,
              color: random_color()
          } 
      }
    } 

    lifter = { x: 0, y: 0, width: 100, height: 20, color: "#474747" }
    controller = { x: lifter.width / 2 - 15, y: lifter.y + lifter.height, width: 30, height: 25, color: "DeepSkyBlue" }

    setInterval(draw, fps)
}

function draw() {  
 
    canvas.width = canvas.width
    for (let slot of slots) {
        for (let brick of slot) {
            context.fillStyle = brick.color
            context.strokeRect(brick.x, brick.y, brick.width, brick.height)
            context.fillRect(brick.x + 5, brick.y + 5, brick.width - 10, brick.height - 10)
            context.fillStyle = 'black'
            context.font = "bold 15pt Courier"
            context.fillText(brick.name, brick.x + brick.width / 2 - 15, brick.y + brick.height / 2)
   	  }
    }   

        // Lifter
    context.fillStyle = lifter.color
    context.strokeRect(lifter.x,lifter.y,lifter.width,lifter.height)
    context.fillRect(lifter.x+5,lifter.y+5,lifter.width-10,lifter.height-10) 
    
    // Controller
    context.fillStyle = controller.color
    context.strokeRect(controller.x,controller.y,controller.width,controller.height)
    context.fillRect(controller.x+5,controller.y+5,controller.width-10,controller.height-10)
    context.fillStyle = "black" 
    

    if(controlledTile) {
       // controlled tile
      context.fillStyle = controlledTile.color
      context.strokeRect(controlledTile.x,controlledTile.y,controlledTile.width,controlledTile.height) 
      context.fillRect(controlledTile.x+5,controlledTile.y+5,controlledTile.width-10,controlledTile.height-10) 
      context.fillStyle = 'black'
      context.font = "bold 15pt Courier"
      context.fillText(controlledTile.name,controlledTile.x + controlledTile.width/2-15, controlledTile.y + controlledTile.height/2)
    } 
} 

function find_slot(name) { 
   for(let i=0;i<slots.length;i++)
       if(slots[i].some(tile => tile.name == name))
       return i
} 

function find_empty_slot() {  
    var avaliableSlot   = undefined; 
    while(boundedSlots.includes(avaliableSlot = rand(slots.length)));
    return avaliableSlot;
}

function release_tile(slotNumber,empty_slot,name,tiles) {
    if(tiles.peek().name == name) {
        return []
    }
     

  return [
      ...[grab,lift,moveTo.bind(null,empty_slot),drop,moveTo.bind(null,slotNumber)],
      ...release_tile(slotNumber,empty_slot,name,tiles.slice(0,tiles.length-1))
  ];
} 

function execute(tile1,tile2, reverse) {
    if(!reverse) {
        boundedSlots = [find_slot(tile1),find_slot(tile2)];
    }

    let slotNumber = find_slot(tile2)
    let actions = []
 
    actions[0] = moveTo.bind(null,slotNumber)
    actions = actions.concat(release_tile(slotNumber,find_empty_slot(slotNumber),tile2,slots[slotNumber]))

    if(reverse)
        return actions.concat( [grab,lift,moveTo.bind(null,find_slot(tile1)),drop])

    return actions.concat(execute(tile2,tile1,true))
}
 

function all(actions) { 
    return actions.shift()().then(actions.length ? all.bind(null,actions) : (data) => {})  
} 

function moveTo(slotNumber) {
    return new Promise((resolve,reject) => {
        let moveAnimation = setInterval(function() {
            
            if (lifter.x == slotNumber * 100) {
                clearInterval(moveAnimation)
                observedSlot = slots[slotNumber] 
                resolve(observedSlot)
            }
            if (lifter.x < slotNumber * 100) {
              lifter.x += 1
              controller.x += 1
              if (controlledTile)
                  controlledTile.x += 1
            }
            else {
                lifter.x -= 1
                controller.x -= 1
                if (controlledTile)
                    controlledTile.x -= 1
            }   
       }, fps / 5)
   })
}

function grab(slot) {
    slot = observedSlot
    return new Promise((resolve,reject) => {
      let grabAnimation = setInterval(function(){
        
        if(slot[slot.length - 1 ].y == controller.height    +  lifter.height + 16){
           clearInterval(grabAnimation)
           controlledTile = slot[slot.length - 1]
           controlledTile.y -= 15
           slot.pop() 
           resolve(controlledTile)
        }
        
        controller.height += 1
      }, fps / 5)
    })
}

function lift(tile) {

   tile = controlledTile
   return new Promise((resolve,reject) => {
       let liftAnimation = setInterval(function() {
           if(controller.height == 25) {
               clearInterval(liftAnimation)
               resolve(tile)
           }
           controller.height -= 1
           tile.y -= 1
       }, fps/5)
   })
}

function drop(tile) {
    tile = controlledTile  
    return new Promise((resolve,reject) => {
        
        document.querySelector('#detache').play()
        let dropAnimation = setInterval(function() { 
         
            let y = observedSlot.length == 0 ? canvas.height :  observedSlot[observedSlot.length - 1 ].y
            if (tile.y + tile.height == y) {
                clearInterval(dropAnimation)
                observedSlot.push(tile)
                controlledTile = undefined  
                document.querySelector('#drop').play()
                resolve(observedSlot)
            
            }
            tile.y += 1
        }, fps / 10)
    })
}

function test(){
  moveTo(2).then( grab ).then(lift).then(moveTo.bind(null,5)).then(drop.bind(null,controlledTile)).then(moveTo.bind(null,1))
}
 

Array.prototype.peek = function(){
  return this[this.length - 1]
}

function random_color() {
    var red = Math.floor(Math.random()*256);
    var green = Math.floor(Math.random()*256);
    var blue = Math.floor(Math.random()*256);
    return `rgb(${red},${green},${blue})`;
}

function rand(to) {
    return Math.floor(Math.random() * to );
}


window.onload = function() {
    if(document.getElementById('canvas')) {
        init()
        document.getElementById("execute").onclick = function() {
            let [tile1,tile2] = document.getElementById("tilesNames").value.split(" ")
            all(execute(tile1,tile2))
        }
    }
}

