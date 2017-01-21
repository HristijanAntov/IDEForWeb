var Tab = function(containerElement,editorsElement,fileNode){
    this.containerElement = containerElement;
    this.editorsElement   = editorsElement;
    this.fileNode	      = fileNode;
     
    this.find_replace = undefined;
     
    this.id = rand();
    this.dirty_check = undefined;
    this.extension = fileNode.name.split(".");
    this.extension = this.extension[this.extension.length-1];
      
    this.parse = undefined;
    this.getRecommendations = undefined;
    this.bindSelectedWord   = undefined;


    // Sekoja razlicna sintaksa odi so razlicen parse metod i razlicni preporaki zatoa 
    // e ovoj dolg switch statemnt
    // po default (dokolku dadeniot fajl e .txt ne davame nikakvi preporaki i ne parsirame nisto osven istiot kontent od
    // textarea-ta)
    switch(this.extension) {
        case "html":
            this.parse = parse;
            this.getRecommendations = getRecommendations;
            this.bindSelectedWord = bindSelectedWord;
	 		break;
	 	case "js"  :
	 		this.parse = parseJS;
	 		this.getRecommendations = getRecommendationsJS;
	 		this.bindSelectedWord = bindSelectedWordJS;
	 		break;
	 	case "css" :
	 		this.parse = parseCSS;
	 		this.getRecommendations = getRecommendationsCSS; 
	 		this.bindSelectedWord = bindSelectedWordCSS;
	 		break;

	 	default: 
	 		this.getRecommendations = function(model) {
	 			return null;
	 		} 
	 		break;
    }
	
    this.key_bindings = [

        {
            action: "quick-open-show",
            keys: [ctrlIsPressed, key_m_isPressed],
            resolved: [ctrlIsPressed, key_m_isPressed]
        },
		{
            action: "save",
            keys:[ ctrlIsPressed  ,  key_s_IsPressed ],
            resolved:[ ctrlIsPressed  ,  key_s_IsPressed ]
        },
        {  
            action: "select-current-word", 
            keys: [ctrlIsPressed,key_d_isPressed],
            resolved: [ctrlIsPressed,key_d_isPressed]
        },
		{  
			action: "unlink-current-tab",
			keys: [ctrlIsPressed,key_q_isPressed],
			resolved: [ctrlIsPressed,key_q_isPressed]
		},
	    { 
			action: "type-{}",
			keys: [shift_isPressed,key_brackets_isPressed],
			resolved: [shift_isPressed,key_brackets_isPressed]
		},
		{  
			action: "type-()",
			keys: [shift_isPressed,key_curlyBrackets_isPressed],
			resolved: [shift_isPressed,key_curlyBrackets_isPressed]
		},
		{  
			action: "type-[]",
			keys: [key_brackets_isPressed],
			resolved: [key_brackets_isPressed]
		},
		{  
			action: 'type-""',
			keys: [shift_isPressed,key_apostrophes_isPressed],
			resolved: [shift_isPressed,key_apostrophes_isPressed]
		},
		{  
			action: "type-''",
			keys: [key_apostrophes_isPressed],
			resolved: [key_apostrophes_isPressed]
		},
        {
            action: "show-find-replace",
            keys: [ctrlIsPressed,key_f_isPressed],
            resolved: [ctrlIsPressed,key_f_isPressed]
        },
        {
            action: "hide-find-replace",
            keys: [escIsPressed],
            resolved: [escIsPressed]
        }
	   ];
	 
	 this.create();
}
Tab.prototype.create = function() { 
    var order = parseInt($('.tabs .tab').toArray().map(tab => parseInt($(tab).css('order'))).reduce((max,current) => max < current ? current : max,0));
    order += 1;
    var view =`
	<div id=${this.id} class="tab" style="order: ${order}" onclick="changeTab(${this.id})">
 		 <span class="tab-to-save">*</span>
		 <span class="tab-name">${this.fileNode.name}</span>
    	 <span class="tab-remove" onclick="removeTab(${this.id})">x</span>
  	 </div>
	` 
	var model = `
	<div id="editor-${this.id}" class="editor editor-hidden" >
        <div class="lines"></div> 
        <pre class="container-cursor-mapper"></pre>
        <pre class="view"></pre>
        <textarea class="model" spellcheck="false" wrap="hard">${this.fileNode.content}</textarea> 
    </div>
	`
	var cursor = `<span id="cursor-${this.id}" class="cursor"></span>`;
    var find_replace = `
	<div id="find-${this.id}" class="find-replace-container hidden-widget">
        <div class="find-replace-inputs">
             <input class="search-field" type="text" placeholder="Find">
             <input class="replace-field" type="text" placeholder="Replace">
        </div>
        <div class="find-replace-options">
            <ul class="buttons"> 
                 <li class="btn-previous-match" title="Previous match">
                     <i class="fa fa-arrow-left"></i>
                 </li>
                 <li class="btn-next-match" title="Next match">
                     <i class="fa fa-arrow-right"></i>
                 </li>
                  <li class="btn-regular-expression" title="Regular expression">
                     <i class="fa fa-asterisk"></i>
                 </li>
                 <li class="btn-dispose" title="Close">
                     <i class="fa fa-remove"></i>
                 </li>
                   <li class="btn-replace" title="Replace">
                     <i class="fa fa-exchange"></i>
                 </li>
                 <li class="btn-replace-all" title="Replace All">
                     <i class="fa fa-map"></i>
                 </li>
             </ul>
         </div>
     </div>
     `
     
    $(".cursors").append(cursor);
    $(this.containerElement).append(view);
    $(this.editorsElement).append(model);
    $(".find-replaces").append(find_replace);
    this.initAll();
    this.focus();
    
}
Tab.prototype.focus  = function(){ 
	$(this.tab)
	 .addClass("tab-active")
	 .siblings()
	 .removeClass("tab-active");
	
	
	$(this.editor)
	 .removeClass("editor-hidden")
	 .siblings()
	 .addClass("editor-hidden");
	
	$(this.cursor)
     .show().siblings().hide();
     
    $(this.cursor).attr('active','true').siblings().attr('active','false');
    
    
	this.startDirtyChecking();
	 

	var ext = this.extension.toUpperCase();
 	if(ext  == "JS") {
 		ext = "JavaScript";
 	}


	$("#syntax").html(ext);


	 
}

Tab.prototype.unlink = function() {
    this.stopDirtyChecking(); 
    $(this.tab).remove();
    $(this.editor).remove();
    $(this.cursor).remove(); 
} 

Tab.prototype.initAll = function() {
    this.tab = $("#"+this.id).get(0);
    this.editor = $("#editor-"+this.id).get(0);
    this.cursor = $("#cursor-"+this.id).get(0);
    this.con_cursor_mapping = $(this.editor).find(".container-cursor-mapper").get(0);
    this.model = $(this.editor).find(".model").get(0);
    this.view = $(this.editor).find(".view").get(0); 
    this.wrapper_lines = $(this.editor).find(".lines").get(0);
    this.find_replace = new FindReplace($("#find-"+this.id).get(0),this); 
} 

Tab.prototype.startDirtyChecking = function() {
    this.model.focus(); 
    var _self = this;
    _self._lines = count_lines(_self.model);
    _self._current_line = getCurrentLine(_self.model);
    _self.performance = 0;
    _self._content =  _self.model.content;
    _self._cursor_position = _self.model.selectionEnd;
    this.dirty_check = 	setInterval(function() { 
    if(_self.lines != count_lines(_self.model) || _self._current_line != getCurrentLine(_self.model) ) {
        draw_lines(_self.wrapper_lines,count_lines(_self.model),getCurrentLine(_self.model),_self.editor.id);
        shrinkEditor(_self.editor,_self.model,_self.view);
        _self.lines = count_lines(_self.model);
        _self._current_line = getCurrentLine(_self.model);
    }  
    if(_self._content != _self.model.value ||  _self._cursor_position != _self.model.selectionEnd) {
        var orientation = `
		Line: ${getCurrentLine(_self.model)} , 
        Column: ${getCurrentColumn(_self.model)}
		`;
			     
        $("#orientation").html(orientation);   
           if(_self.parse == undefined) { 
               $(_self.model).css("color","white");
               return ;
           }

        _self.parse(_self.model,_self.view,_self.con_cursor_mapping,_self.find_replace)
        detectBrackets(_self.model,_self.view)
        detectBracketsDown(_self.model,_self.view)
        position_cursor(_self.cursor,$(_self.con_cursor_mapping).find(".cursor-mapper").get(0))
        _self.performance += 1;
        _self._content = _self.model.value;
        _self._cursor_position = _self.model.selectionEnd;
        
    }
     		
  },1);
} 

Tab.prototype.stopDirtyChecking = function() {
    clearInterval(this.dirty_check);
}
 
Tab.prototype.dispatchAction = function(action) {
    if(action === "save") {
        this.fileNode.content = this.model.value; 
        $(this.tab).find(".tab-to-save").hide(); 
        _saveFile(file_explorer,this.fileNode.id)
    }	
    if(action === "unlink-current-tab") {
        removeTab(this.id);
    } 		
    if(action === "type-{}") {
       putBrackets(this.model,"{");
    }
    if(action === "type-[]") {
        putBrackets(this.model,"[");
    }
    if(action === "type-()") {
	   putBrackets(this.model,"(");
    }
    if(action === "type-''") {
        putBrackets(this.model,"'");
    }
    if(action === 'type-""') {
        putBrackets(this.model,'"');
    }
    if(action === "select-current-word") {  
        setSelectionOnCurrentWord(this.model); 	 
    }
    if(action === "show-find-replace") {
        this.find_replace.show();  
    }
    if(action === "hide-find-replace") {
        this.find_replace.hide();  
    }
    if(action === "quick-open-show") {
        quickOpen.ui.show(file_explorer)
    }

}
 
 
Tab.prototype.checkBindings = function(key) { 
	for(var i in this.key_bindings) { 
        var _key = this.key_bindings[i].keys.shift(); 
        if(_key != key) {
            this.key_bindings[i].keys = this.key_bindings[i].resolved.map( k => k);
            continue; 
        }
		if(this.key_bindings[i].keys.length == 0) {
			this.dispatchAction(this.key_bindings[i].action);
			return true; // Znaci se ispolnila dadenata akcija
		} 	
	}	
	return false; // Znaci nitu edna akcija od kombinacija na keys ne e ispolneta 
} 

Tab.prototype.events = function (){  
    var autocomplete = document.getElementsByClassName("autocomplete-container")[0];
    var model   = this.model; 
    var ccm     = this.con_cursor_mapping;
    var node    = this.fileNode;
    var tab	    = this.tab; 
    var _self	= this;  
    $(model).keydown(function(key){ 
    var key = key.keyCode;    
    var controlElement = $(autocomplete).children().first().next()	
    var status = _self.checkBindings(key);
    if(status) return false; //  Go sprecuvame defaultniot nastan dkolku nastanal key_binding (funckijava vrakja true ili false)
    if(controlElement.val() != "") { 
        if(key  === topArrowIsPressed) {
		    select_prev(autocomplete)
			notifyAutocompleteView(autocomplete)
			return false
	    }
	    if(key  === bottomArrowIsPressed) {
			select_next(autocomplete)
			notifyAutocompleteView(autocomplete)
			return false
		}
	 }
     if(key  === tabIsPressed) {
         putWord(model,"\t");
         return false; 
	 }
	 if(key  === enterIsPressed) {
         var controlElement = $(autocomplete).children().first().next()	 
         var indent_characters = getIndentationOfLastLine(model)		
         if(controlElement.val() != "") {
	         _self.bindSelectedWord(autocomplete,model)
             close_autocomplete(autocomplete)
             return false
         }
         putWord(model,"\n"+indent_characters);
         return false;
	 } 
     }); 
    $(model).keyup(function(key) {  
        if(model.value != node.content) {
            $(tab).find(".tab-to-save").show();
        } 
		var key = key.keyCode; 
		for(var i in this.key_bindings) {  
		    // Stom keyUp e trigirano  go invalidizirame prethodno razvieniot binding
		    this.key_bindings[i].keys = this.key_bindings[i].resolved.map(k=>k);
		} 
	   if( key === leftArrowIsPressed || key === rightArrowIsPressed){
					close_autocomplete(autocomplete)
					return true
	    }
	   if(key === topArrowIsPressed   || key === bottomArrowIsPressed){
					return true
	    }
				
       // Ova vrakja ili lista od objekti ili null vo slucajot na null ne preporacuvame nisto i ne go pustame voopsto autocomplitot (skrien e)
	   var recommendations = _self.getRecommendations(model)
       if(!recommendations) {

	       close_autocomplete(autocomplete)
		   return true;
       }
	   // Ova e veke prikazuvanje na preporakite
       putRecommendations(autocomplete,recommendations) 
       position_autocomplete(autocomplete,ccm)
       open_autocomplete(autocomplete)		
    }); 	
		  
    // Ovie nadolu nastani se poveke za GUI logikata 
    // sto pravi tabovite da bidat dinamicno razmestuvani
    // nesto slicno kako sto e mozno vo Chrome Browser-ot
    // i vo poveketo moderni text editori 
	$(tab).mousedown(function(e) { 
       var x = $(this).offset().left;
       var y = $(this).offset().top; 
       var cursorX = e.clientX;
       var cursorY = e.clientY;
    
        state.isDragging = true;
        state.element    = $(this);
        state.initialPosition = {x:x,y:y}; 
        state.pseudoOffset.x = cursorX - x;
        state.pseudoOffset.y = cursorY - y; 
        state.tabPositions = $(".tab:not('#"+ $(state.element).attr('id') +"')").toArray()
        .map(tab => Object.assign($(tab).offset(),{id:$(tab).attr('id')}))
        .map(pos => ({x:pos.left,y:pos.top,id:pos.id}));
    
      
        $(state.element).css({ 
            'transition':'none',
            'z-index':'100'
        });
    
})

     $(tab).mouseup(function(e){  
      
      if(state.isDragging){ 
          state.element.css({ 
             'transition':'transform 150ms ease-out',
             'transform':'translate(0px,0px)',
             'z-index':'0'
         })
       if(state.overlappingElement != undefined){
         swapOrder() 
       }
     
       $('.tab').css({
         'transition':'none',
         'transform':'translate(0px,0px)'
       })
       state.element = undefined;
       state.overlappingElement = undefined    
      }
  
 
      state.isDragging = false;
 })
  
		 
}




function rand(){
	return Math.floor(Math.random()*2e11);
} 