var state = {
    isDragging:false,
    element:undefined,
    overlappingElement:undefined,
    initialPosition: {
        x:0,
        y:0
    },
    pseudoOffset:{
        x:0,
        y:0
    },
    tabPositions:[],
    isDebouncing:false
}



$('body').mousemove(function(e){
 
  if(!state.isDragging){
        return true;
  } 
  
   
  
  var translateX = e.clientX - state.initialPosition.x - state.pseudoOffset.x  
  var translateY = e.clientY - state.initialPosition.y - state.pseudoOffset.y
 
  state.element.css({
     'transform': 'translate('+ translateX +'px,'+ translateY +'px)'
  })
  
  for(var i = 0;i<state.tabPositions.length;i++){
      if(!state.isDebouncing && hasCollision({
          x:state.element.offset().left,
          y:state.element.offset().top
      },
      state.tabPositions[i])){ 
          state.overlappingElement = $('#' + state.tabPositions[i].id)  
          state.isDebouncing = true 
          
          reorder(i).then(function(data){  
             state.tabPositions = $(".tab:not('#"+ $(state.element).attr('id') +"')").toArray()
            .map(tab => Object.assign($(tab).offset(),{id:$(tab).attr('id')}))
            .map(pos => ({x:pos.left,y:pos.top,id:pos.id}));
             state.isDebouncing = false
             
                
          })
            
      }
  }
  
    
   
 })
 
 function swapOrder(){
    var elementOrder = state.element.css('order');
    state.element.css('order',state.overlappingElement.css('order'));
    state.overlappingElement.css('order',elementOrder);
         
 }

 function reorder(index) {
   return new Promise(function(resolve,reject){
     
     
     var difference = state.initialPosition.x - state.tabPositions[index].x; 
     
     state.overlappingElement.css({
         'transition':'transform 100ms ease-out',
         'transform' :'translateX('+ difference +'px)'
     })
     var timerId = setTimeout(function(){
          resolve(timerId);
         
     },150)
   })
 }
 function hasCollision(o1,o2) {
     
     var x1 = o1.x;  var x2 = o2.x;
     var y1 = o1.y;  var y2 = o2.y;
     
     var distance = Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2));
      
     return distance < 45 ? true : false
 }
 
 