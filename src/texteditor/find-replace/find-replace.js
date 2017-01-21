var FindReplace = function(container , tab) {
    this.container = container;
    this.model = tab.model; 
    this.tab = tab;
    this.find_matches = []; 
    this.search_content = ""; 
    this.replace_content = "";
    this.regex = false; 
    this.search_field    = $(this.container).find(".search-field").get(0);
    this.replace_field   = $(this.container).find(".replace-field").get(0);
    this.btn_prev_match  = $(this.container).find(".btn-previous-match").get(0);
    this.btn_next_match  = $(this.container).find(".btn-next-match").get(0);
    this.btn_dispose     = $(this.container).find(".btn-dispose").get(0);
    this.btn_replace     = $(this.container).find(".btn-replace").get(0);
    this.btn_replace_all = $(this.container).find(".btn-replace-all").get(0);
    this.btn_regular_expression = $(this.container).find(".btn-regular-expression").get(0);
    
    this.events();
}
FindReplace.prototype.hide = function() {
    $(this.container).addClass("hidden-widget");
    this.search_content  = "";
    this.replace_content = "";
    this.search_field.value = "";
    this.replace_field.value = "";

    var current = this.find_matches.find( match => match.current ); 
    if(current) 
        this.model.setSelectionRange(current.start,current.end);
    else {
        this.model.focus(); 
    } 

    this.find_matches = [];
    this.regex = false;
    $(this.btn_regular_expression).removeClass("option-checked"); 
}

FindReplace.prototype.show = function() {
    $(this.container).removeClass("hidden-widget");
    this.search_field.focus(); 
}

FindReplace.prototype.next = function() {
    for(var i=0;i<this.find_matches.length;i++) {
        if(this.find_matches[i].current == true) { 
            this.find_matches[i].current = false;
            var _next = i + 1 < this.find_matches.length ? i + 1 : 0;
            this.find_matches[_next].current = true;
            break;
        }
    }
}

FindReplace.prototype.prev = function() { 
    for(var i=0;i<this.find_matches.length;i++) {
        if(this.find_matches[i].current == true) {
            this.find_matches[i].current = false;
            var _prev = i - 1 >= 0  ? i - 1 : this.find_matches.length - 1;
            this.find_matches[_prev].current = true;
            break;
        }
    }
}


FindReplace.prototype.events = function() {
    var _self = this;
    $(this.btn_dispose).click(function() {
        _self.hide();
    });
    
    $(this.btn_next_match).click(function() {
        _self.next();
        _self.selectAndFocusNextMatch(); 
    });
    
    $(this.btn_prev_match).click(function() {
        _self.prev();
        _self.selectAndFocusNextMatch(); 
    });
    
    $(this.btn_regular_expression).click(function() {
        $(this).toggleClass("option-checked");
        _self.regex = !_self.regex; 
    });
    
    $(this.btn_replace).click(function() {
        _self.replaceNext();  
    });
    
    $(this.btn_replace_all).click(function() {
        _self.replaceAll();
    });
     
    $(this.search_field).keyup(function(key) {
        key = key.keyCode;
        if(_self.search_content == $(this).val()) {
            if(enterIsPressed == key) {
                _self.next();
                _self.selectAndFocusNextMatch();    
            }
            if(escIsPressed == key) {
                _self.hide();
            }
            
            return true;
        }
        
       _self.search_content = $(this).val();  
        
       if(_self.search_content == "") {
           _self.tab._content = Math.random().toString();
           return true;
       }
          
      _self.tab._content = Math.random().toString();  
      var status = false;
      
      if(!_self.regex) {
          status = _self.bindMatches();
         if(!status) {
             $(_self.search_field).addClass("failure");
         }
         else {
             $(_self.search_field).removeClass("failure");
         }
       }   
      if(status)
          _self.selectAndFocusNextMatch();                                      
    });  
}  

FindReplace.prototype.selectAndFocusNextMatch = function() {
    var current = this.find_matches.find( match => match.current ); 
    
    if(!current) return false; 
    
    var lines_before = this.model.value.substring(0,current.start)
                                      .split(/\n/).length - 1;
    var offsetTop = 100;
    $(".editor-controller").scrollTop( lines_before * 25 - offsetTop);      
}


FindReplace.prototype.bindMatches = function() {
    this.find_matches = [];
    var text = this.model.value;
    var matching_str = this.search_content; 
    var has = false;
    
    if(this.search_content == "")
        return has;
        
    for(var i=0;i<text.length;i++) {
        if(text.startsWith(matching_str,i)) {
            this.find_matches.push({
                start: i,
                end: i + matching_str.length,
                current: !has
            });
            has = true;
            i += matching_str.length;
        }
    }     
    return has;
}

FindReplace.prototype.replaceNext = function() {
    var current = this.find_matches.find( match => match.current ); 
    
    if(!current) return false; 
    
    var replaceWith = this.replace_field.value;
    var word = this.model.value.substring(current.start,current.end);
    var before = this.model.value.substring(0,current.start);
    var after = this.model.value.substring(current.start);
    
    after = after.replace(word,replaceWith);
    
    this.model.value = before + after;
    
    
    if(!this.regex) {
    this.bindMatches();
    }
    else {
    //todo za regularen izraz
    }
    
    this.selectAndFocusNextMatch(); 
}
FindReplace.prototype.replaceAll = function() {
    var replaceWith = this.replace_field.value;
    var word = this.search_content;
    if(word == "") return false;
    if(!this.regex) { 
        word = word.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        word = new RegExp(word,"g");
        this.model.value = this.model.value.replace(word,replaceWith); 
        this.bindMatches();
    }
    else {
        //todo za regularen izraz
    }
    
    this.selectAndFocusNextMatch();   
}