var ControllerData = {
    buildToken: "",
    nodeToFind: undefined
}

var file_explorer = {};

function draw_tree(tree, indent) {

    ControllerData.buildToken +=
        `<ul class="node">
	      <li>
	       <h4  class="node-details" style='padding-left:${indent}px' node-id = '${tree.id}'`

    if (tree.type === 'directory') {

        ControllerData.buildToken +=
            [
                " onContextMenu=\"contextmenuAction(this,'directory'); return false;\" "
                , " onclick='toggleChildren(this)'> "
                , " <label class='caret'><label style='display:none;'>+</label><label>-</label></label> "
                , " <img src='/images/folder.png' class='node-image'> "
            ]
                .reduce((concatenated, current) => concatenated.concat(current));

    }
    else {

        var imageMap = {
              "txt": "/images/txt.png"
            , "html": "/images/html.png"
            , "js": "/images/js.png"
            , "css": "/images/css.png"
        }

        var extension = tree.name.split('.');
        extension = extension[extension.length - 1];
        var imageUrl = imageMap[extension] || "/images/txt.png";

        ControllerData.buildToken +=
            [
                " onContextMenu=\"contextmenuAction(this,'file'); return false;\" "
                , " onclick='openFile(this)'> "
                , "<img src='" + imageUrl + "' class='node-image'>"
            ]
                .reduce((concatenated, current) => concatenated.concat(current));

    }

    ControllerData.buildToken += "<span class='node-name'>" + tree.name + "</span> </h4>"

    if (tree.type === "directory") {

        for (var i in tree.children) {
            draw_tree(tree.children[i], indent + 15)
        }
    }
    ControllerData.buildToken += "</li></ul>"

}

function toggleChildren(nodeElement) {

    $(nodeElement).siblings().toggle("ease")
    $(nodeElement).find(".caret").children().toggle()
}


function openFile(nodeElement) {
    var id = nodeElement.getAttribute('node-id');
    findResource(file_explorer, id);

    var filenode = ControllerData.nodeToFind;
    openTab(filenode);
}





function findResource(tree, id) {

    if (tree.id === id) {
        ControllerData.nodeToFind = tree;
        return true;
    }

    if (tree.type === 'directory') {
        for (var i = 0; i < tree.children.length; i++) {
            var child = tree.children[i];
            findResource(child, id);
        }
    }


    return true;
}


// Ovde pravime povtorno Depht First Search
function deleteNode(tree, node_id) {

    if (tree.type === 'file') return;

    for (var i = 0; i < tree.children.length; i++) {
        if (tree.children[i].id === node_id) {
            tree.children.splice(i, 1)
            return;
        }
        else {
            deleteNode(tree.children[i], node_id)
        }
    }
}








function create() {
    ControllerData.buildToken = ""

    var tree_map = $(".wrapper-treeview").get(0)
    var project_name = window.location.href.split('/');
    project_name = project_name[project_name.length - 1];

    $.ajax({
        "url": "/file_structure/" + project_name,
        "success": function (file_explorer1) {

            file_explorer = file_explorer1;
            draw_tree(file_explorer1, 10)
            tree_map.innerHTML = ControllerData.buildToken

            for (var tab of tabs) {
                findResource(file_explorer, tab.fileNode.id);
                tab.fileNode = ControllerData.nodeToFind;
            }

            Repl._open()
            
        },
        "error": function (err) {
            console.log(err);
        }
    })


}

function contextmenuAction(nodeElement, type) {
    var menuElement = $(".contextmenuAction")
    var dataElement = menuElement.children().first().next()
    var listElement = menuElement.children().first()
    listElement.html("")
    var data;
    var id = nodeElement.getAttribute("node-id");
    findResource(file_explorer, id);
    var actualNode = ControllerData.nodeToFind;
    var options = [];
    //dataElement.val(JSON.stringify(actualNode));

    if (type == 'directory') {

        options = [
            {
                name: "New File",
                _event: `addFileToProject(file_explorer,'${id}')`,

            },
            {
                name: "New Folder",
                _event: `addDirectoryToProject(file_explorer,'${id}')`
            },
            {
                name: ` 
			<h5 class='rename'
			onclick="_renameFile(file_explorer,document.getElementById('rnmNew').value,'${id}')">
				Rename:
			</h5>
			<input id="rnmNew" type="text" value="${actualNode.name}">
		    `}
        ];



    }
    else {

        options = [
            {
                name: ` 
			<h5 class='rename'
			onclick="_renameFile(file_explorer,document.getElementById('rnmNew').value,'${id}')">
				Rename:
			</h5>
			<input id="rnmNew" type="text" value="${actualNode.name}">
		    `},
            {
                name: "Delete",
                _event: `_removeFile(file_explorer,'${id}')`
            }];
    }


    for (var option of options) {
        listElement.append(`
			 <li onclick=${option._event}> ${option.name} </li>`)
    }


    contextmenuEvents();
    position_menu(menuElement);
}



function position_menu(menu) {
    var position = {}
    position.left = event.clientX;
    position.top = event.clientY;
    menu.css(position)
    menu.show();
}


function contextmenuEvents() {
    $("#rnmNew ").click(function () {
        event.stopPropagation();
    })
    $(":not('.contextmenuAction li, .actions, #rnmNew , .rename ')").click(function () {

        $(".contextmenuAction").hide();
    });
}







// Ovie mi se pomosni metodi , se ispoistovetuvaat so slednata akcija sto treba da se prezeme
// vo Api.js fajlot , vaka go napraviv bidejki poubavo e da gi odlepam baranjata do serverot
// od biznis logikata

function addFileToProject(tree, parent_id) {

    var result = findResource(tree, parent_id);
    var path = ControllerData.nodeToFind.path + "\\NewFile.txt";
    addResource(path, 'file');

}

function addDirectoryToProject(tree, parent_id) {

    var result = findResource(tree, parent_id);
    var path = ControllerData.nodeToFind.path + "\\NewFolder";
    addResource(path, 'directory');

}


function _saveFile(tree, id) {
    var result = findResource(tree, id);
    var path = ControllerData.nodeToFind.path;
    var content = ControllerData.nodeToFind.content;
    saveFile(path, content);
}
function _renameFile(tree, newname, id) {
    var result = findResource(tree, id);
    var oldpath = ControllerData.nodeToFind.path;

    var newpath = oldpath.split('\\');
    newpath = newpath
        .slice(0, newpath.length - 1)
        .join("\\") + '\\' + newname
    renameFile(oldpath, newpath);

}
function _removeFile(tree, id) {
    var result = findResource(tree, id);
    var path = ControllerData.nodeToFind.path;

    removeFile(path);
}




//Za testiranje vo konzola samo...
function print_tree(tree, indent) {
    console.log(indent + tree.path, tree.name)
    if (tree.type === "directory") {
        for (var i in tree.children) {
            print_tree(tree.children[i], indent + "   ")
        }
    }
}