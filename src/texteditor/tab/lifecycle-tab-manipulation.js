var tabs = []; 

window.onload = function() { 
    create();
}

function openTab(filenode) {
    var exists = false;
    for(var tab of tabs) {
        tab.stopDirtyChecking();
        tab.find_replace.hide();
        if(tab.fileNode.id == filenode.id) {
	          tab.focus();
	          exists = true; 
        }
    }    
	
    // Ako fajlot e vekje otvoren ne treba da go otvarame vo drug tab
    // Dokolku ne postoi go otvorame
    if(!exists) { 
        var tab = new Tab($(".tabs").get(0),$(".editor-controller"),filenode);
	      tabs.push(tab);
	      tab.events();
    } 	 
    
} 
    
function removeTab(id) {
    var index = 0;
    tabs = tabs.filter(function(t,i) {
    if(t.id == id) {
        index = (i + 1 < tabs.length) ? i + 1 : 0; 
        tabs[index].focus();
        t.unlink();
        $(".tab").eq(index).click();
    }
    return t.id != id;
    });  
}

function changeTab(id) {
    for(var tab of tabs) {
        if(tab.id == id)
	          tab.focus();	   
        else {
            tab.stopDirtyChecking();
            tab.find_replace.hide();
        }
    }    
}