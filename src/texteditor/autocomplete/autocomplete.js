function getRecommendations(model) {
    var text = model.value;
	var textToSplit = text.substring(0,model.selectionEnd); 
	var last_word = textToSplit.split(/</g);
	 
	if(last_word.length === 1 || last_word[last_word.length-1] === "") {
	    return null;
	} 
	
	// Samo posledniot zbor do '<'  karakterot ne interesira
	last_word = last_word[last_word.length-1]
	
	// logika za naogjanje na sovpagjanje pomegu delumno iskucaniot tag i tagot sto vsusnost se sovpagja so nego
	var recommendations = [] 
	for(var i in available_tags) {
        var available_tag = available_tags[i] 
		if(available_tag.includes(last_word)) {
			recommendations.push({
				word:last_word,
				tag:available_tag
			})
		} 
	}

 
	if(recommendations.length == 0) {
		return null;
	}
	 
	return recommendations.sort( function(rec){
		rec.tag.length - rec.word.length
	}).reverse()
}

function close_autocomplete(autocomplete){
    $(autocomplete).hide();
    $(autocomplete).children().first().next().val("")
}
function open_autocomplete(autocomplete){
    $(autocomplete).show();
}

function position_autocomplete(autocomplete,ccm){
    var left = $(ccm).find(".cursor-mapper").offset().left
    var top  = $(ccm).find(".cursor-mapper").offset().top + 25
    $(autocomplete).css({"left":left,"top":top})
}

function putRecommendations(autocomplete,recommendations){
    $(autocomplete).scrollTop(0)
    var listElement =  $(autocomplete).children().first()
    var first = true
    listElement.html("")
    for(let recommendation of recommendations){
	    var tag  = recommendation.tag
        var word_regex = new RegExp(recommendation.word)
        var color = false;
        
		if(cssPropertyValueMap["color"].indexOf(tag) != -1) {
            color = tag  
		} 
		
        tag = tag.replace(word_regex,'<span style="color:#2196F3;">' + recommendation.word+'</span>') 
		if(first) { 
            var template = `
			<li class="auto-active" 
			    word="${recommendation.word}" 
				tag="${recommendation.tag}" 
				type="${recommendation.type}">
			    ${color ? "<span class='color-squared' style='background-color:"+ color+";'></span>": ""}
                ${tag}
			</li>
			`
			listElement.append(template) 
            first = false 
	    }
	    else { 
			var template = `
			<li word="${recommendation.word}" 
			    tag="${recommendation.tag}" 
				type="${recommendation.type}">
			    ${color ? "<span class='color-squared' style='background-color:"+ color+";'></span>": ""}
				${tag}
			</li>
			`
			listElement.append(template) 
		}
    }
		
	// ovde se pamti sostojbata za sto e selektirano vo momentot i sto i da ni pritreba :)
	var controlElement = $(autocomplete).children().first().next()
	controlElement.val(`{"active":0}`)
		
}

function select_next(autocomplete){
    var content = JSON.parse($(autocomplete).find("input").val()) 
    var total = $(autocomplete).children().first().children().length
	 
    content.active = (content.active + 1 < total) ? content.active + 1 : 0
    $(".autocomplete-container").scrollTop((content.active - 7) * 25);   
    $(autocomplete).find("input").val(JSON.stringify(content))
}
function select_prev(autocomplete) {
    var content = JSON.parse($(autocomplete).find("input").val())
    var total = $(autocomplete).children().first().children().length

	content.active = (content.active - 1 >= 0) ? content.active - 1 : total - 1
	$(".autocomplete-container").scrollTop((content.active - 7) * 25);
	$(autocomplete).find("input").val(JSON.stringify(content))
}

function notifyAutocompleteView(autocomplete){
    var content = JSON.parse($(autocomplete).find("input").val()) 
    var listElement   =  $(autocomplete).children().first()
    var activeElement = $(listElement.children().get(content.active))
    activeElement.addClass("auto-active").siblings().removeClass("auto-active")		
}

function bindSelectedWord(autocomplete,model){
    var content = JSON.parse($(autocomplete).find("input").val()) 
    var listElement = $(autocomplete).children().first()
    var activeElement = $(listElement.children().get(content.active))
	var word = activeElement.attr("word")
	var tag = activeElement.attr("tag")
    var before = model.value.substring(0,model.selectionEnd-word.length-1)
	var tokenToAppend =`<${tag}></${tag}>`;
    var after  = model.value.substring(model.selectionEnd)
    
	model.value = before + tokenToAppend + after
	model.selectionEnd = before.length + tokenToAppend.length / 2 
}
 
function getRecommendationsCSS(model){ 
	var text = model.value;
	var textToSplit = text.substring(0,model.selectionEnd);  
    var last_word = ""; 
    var recommendations = []; 
    var ctx = detectContextCSS(model);
    var end = ctx.end;
    
	ctx = ctx.context; 
    // Orientacija vo koj context se naogjame
    // Bidejki nema smisla da mu preporacuvame na koderot propertija dokolku toj momentalno
    // ureduva vrednosti na dadeno property ili obratno
    if(ctx == "property") {
        textToSplit = textToSplit.substring(end,model.selectionEnd);
        last_word = textToSplit.match(/[\w+\-*\w*]+/g);
        recommendations = 
		    Object.keys(cssPropertyValueMap)
                .filter(property => property.includes(last_word))
                .map(property => ({tag:property,word:last_word,type:"property"}))   
    }  
    if(ctx == "value") { 
        last_word = textToSplit.substring(end,model.selectionEnd).match(/[\w+\-*\w*]+/g);
        if(last_word == null || last_word.length == 0) {
            last_word = ""
		}
        else {
            last_word   = last_word[last_word.length-1];
		}  
        var property = textToSplit.split(/\:|\;|\{/); 
			
        property = property[property.length-2];
        property = property.match(/[\w+\-*\w*]+/g); 
        
		if(property == null 
		|| property.length == 0 
		|| cssPropertyValueMap[property] == undefined) {
	        property = "all";   
		}
        else {
            property = property[property.length-1]; 
		}  
             
        recommendations = 
		    unique(cssPropertyValueMap[property]
                       .concat(cssPropertyValueMap["all"])
                       .concat(cssPropertyValueMap["color"]))
            .concat("important")
            .filter(function(value) {
               return (value.includes(last_word) || last_word == "" )
                      && value.length != last_word.length
                      && !/\[/g.test(value);
            })
            .map(function(value){
                 return {tag:value,word:last_word,type:"value"}    
            });
    }   
	
	if(recommendations.length == 0){return null;}  
	return  recommendations; 
}
 
function bindSelectedWordCSS(autocomplete,model){
    var content = JSON.parse($(autocomplete).find("input").val()) 
    var listElement = $(autocomplete).children().first()
    var activeElement = $(listElement.children().get(content.active))
    var word = activeElement.attr("word")
    var tag  = activeElement.attr("tag")
    var type = activeElement.attr("type") 
    var before = model.value.substring(0,model.selectionEnd-word.length)
    var tokenToAppend = `${tag}`
    var after  = model.value.substring(model.selectionEnd)
       
	if(type == "property") {
        tokenToAppend = `${tag}: `
    } 
		 
    model.value = before + tokenToAppend + after
    model.selectionEnd = before.length + tokenToAppend.length 
}


// Ova sluzi vo davanjeto na preporaki so cel da znaeme dali da gi mapirame
// Propertijata ili Vrednostite vo zavisnost od toa vo koj context se naogja 
// kursorot
function detectContextCSS(model){
    var se = model.selectionEnd; 
    var text = model.value.substring(0,se);
    var context = undefined; 
    var i = 0;
    for(i = text.length-1;i >= 0;i--){ 
        if(text[i] == "}") {
				break;
        }
        if(text[i] == ";" || text[i] == "{" ) {
            context = "property"; 
            break;
        } 
        if(text[i] == ":") {
            context = "value";
			break;
		}
    }
    return {context:context,end:i};
} 

// Javascript autocomplete od ovde nadolu 
function getRecommendationsJS(model) {
    var text = model.value;
    var textToSplit = text.substring(0,model.selectionEnd); 
    var last_word = textToSplit.split(/\b/g); 	
  
    if(last_word.length == 1 || last_word[last_word.length-1] === "") {
        return null;
	} 
	
    var available_tags = keywords.map(k=>k);   
    var all_words  = text.match(/\w+/g);

    available_tags = unique(available_tags.concat(all_words));
    last_word = last_word[last_word.length-1]; 
   
    var recommendations = [];  
    recommendations = available_tags
        .filter(available_tag => (available_tag.length != last_word.length) && available_tag.includes(last_word))
        .map(available_tag => ({
            word: last_word,
            tag: available_tag,
            similarity: available_tag.split((last_word)).length
    }))
    
    recommendations = recommendations.filter((rec , i) => i < 9);
    
	if(recommendations.length == 0) 
        return null;
    
	return recommendations;
}

function bindSelectedWordJS(autocomplete,model) {
    var content = JSON.parse($(autocomplete).find("input").val()) 
    var listElement   =  $(autocomplete).children().first()
    var activeElement = $(listElement.children().get(content.active))
    var word = activeElement.attr("word") || '' 
    var tag = activeElement.attr("tag")
    var before = model.value.substring(0, model.selectionEnd - word.length)
    var tokenToAppend = `${tag}`;
    var after = model.value.substring(model.selectionEnd)

    model.value = before + tokenToAppend + after
    model.selectionEnd = before.length + tokenToAppend.length 
} 

function unique(arr) { 
    var filtered = [];
    for(var item in arr) {
    item = arr[item];
    if(filtered.indexOf(item) == -1) 
        filtered.push(item)
    }
	return filtered; 
}

 


   