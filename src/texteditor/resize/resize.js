var Resizer = {
    isResizing:false,
    element:'#resize-axis',
    resizableElements:{left:'.resizable-left',right:'.resizable-right'},
    initialPosition:0
}

$(Resizer.element).mousedown(function(e){
  Resizer.isResizing = true;
  Resizer.initialPosition = e.clientX - $(this).offset().left;
 
  $('.cursor[active=true]').css('top','-100000');
  $('*').addClass('no-select');
});

$('body').mouseup(function(){
  Resizer.isResizing = false;  
  
  $('*').removeClass('no-select');
})
$('body').mousemove(function(e){
 if(Resizer.isResizing){
    
  let left = e.clientX - Resizer.initialPosition; 
  let nextWidthLeft = left - $(Resizer.resizableElements.left).offset().left;
  
  let nextWidthRight = "calc( 100% - " + parseInt(nextWidthLeft + 52) + "px)";
  let nextLeftRight  = parseInt(nextWidthLeft + 2 ) + "px";
  
   
  $(Resizer.element).css('left',left);
  
  $(Resizer.resizableElements.left)
    .css('width',nextWidthLeft + 'px'); 
  $(Resizer.resizableElements.right)
    .css({
        'width':nextWidthRight,
        'left' :nextLeftRight
    });
        
}});