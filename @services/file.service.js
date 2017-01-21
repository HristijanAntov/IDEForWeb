var fs = require('fs');
var path = require('path');

// servisi
var AuthService = require('./auth.service');

const Yes = 'Success';
var updateContent = function (_path, content) {

    return new Promise((resolve, reject) => {
        fs.writeFile(_path, content, 'utf8', function (err) {
            if (err) reject(err);
            else resolve(Yes);
        });
    });
}

var addResource = function (_path, type) {

    return new Promise((resolve, reject) => {

        if (type == 'file') {

            fs.writeFile(_path, '', 'utf8', function (err) {
                if (err) reject(err);
                else resolve(Yes);
            });
        }

        if (type == 'directory') {
            fs.mkdir(_path, function (err) {
                if (err) reject(err);
                else resolve(Yes);
            });
        }
    });
}

var renameResource = function (oldpath, newpath) {
    return new Promise((resolve, reject) => {

        fs.rename(oldpath, newpath, function (err) {
            if (err) reject(err);
            else resolve(Yes);
        })
    });
}

var removeResource = function (_path) {
    return new Promise((resolve, reject) => {

        fs.unlink(_path, function (err) {
            if (err) reject(err);
            else resolve(Yes);
        });
    });
}

var transformProjectToJSON = function (_path, node, userId) {

    var projectTree = _generateTree(_path, node, userId);
    return Promise.resolve(projectTree);
}


var _orderDirectoriesFirst = (_path, file1, file2) => fs.lstatSync(path.join(_path, file1)).isDirectory() ? -1 : 1;

/* 
Logikata odi rekurzivno (Depth First Traversal)
celta e od dadena pateka da generirame JSON 
objekt koj sto ke se prikaze na korisnikot 
vo TreeView komponentata otkako toj ke saka da pristapi na nea

- Strukturata na fajlovite vnatre vo folderot 
koj sto go referencira proektot,
ne se zapisuva vo baza ,
bidejki nema smisla nam ni e potrebno da gi pametime
samo proektite i userite sto gi poseduvaat tie proekti
*/

var _generateTree = function (_path, node, userID) {
    var stats = fs.lstatSync(_path);
    var isDirectory = stats.isDirectory();

    // Ovie podatoci se stavaat bilo resursot da e folder ili file
    node.mtime = stats.mtime;
    node.birthtime = stats.birthtime;
    if (isDirectory) {
        var dirname = _path.split('\\');
        dirname = dirname[dirname.length - 1];
        node.name = dirname;
        node.type = "directory";
        node.path = _path;

        var files = fs.readdirSync(_path);
        files = files.sort(_orderDirectoriesFirst.bind(this, _path));
        node.children = [];
        node.id = AuthService.hash(node.path);
        node.ChildrenCount = files.length;
        for (var i in files) {
            node.children.push({});
            var file = files[i];
            _generateTree(path.join(_path, file), node.children[i]);
        }
    }
    else {
        var filename = _path.split('\\');
        filename = filename[filename.length - 1];
        node.name = filename;
        node.type = 'file';
        node.content = fs.readFileSync(_path, 'utf8');
        node.path = _path;
        node.id = AuthService.hash(node.path);
    }

    return node;
}

module.exports = {
    updateContent,
    addResource,
    removeResource,
    renameResource,
    transformProjectToJSON
}
