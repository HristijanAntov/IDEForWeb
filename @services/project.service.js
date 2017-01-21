var fs      = require('fs'); 
var path    = require('path');
var Project = require('../@models/project');

const getHTMLTemplate = (userName) => `<html>
<body>
<!-- Project created by ${userName} -->
</body>
</html>`;

var getUserProjectByName = function(name, userId) {
    return new Promise((resolve, reject) => {
        Project.findOne({ name: name, belongsTo: userId }, function (err, project) {
            if (err || !project) {
                reject(err);
            }
            else {
                resolve(project);
            }
        });
    });
}

var createProject = function(username, name, isDeployed, belongsTo, createdOn) {
    var project = new Project({
        name,
        isDeployed,
        belongsTo,
        createdOn
    });

    return new Promise((resolve, reject) => {
        project.save(function(err, project) {
            if (err) {
                reject(err);
            }
            else { 
                _saveProjectOnDisk(name, username, belongsTo).then(function(status) {
                    resolve(project);
                }, function(err) {
                    console.log(err);
                });
            }
        });
    });
}

var _saveProjectOnDisk = function(projectName, userName, userId) {
    return new Promise((resolve, reject) => {
        var mode = '0777';
        var projectPath = path.join('projects', userId.toString(), projectName); 

        var startPage = {
            template: getHTMLTemplate(userName),
            path: path.join(projectPath, 'index.html')
        }
        
        try {

            fs.mkdirSync(projectPath, mode);
            fs.appendFileSync(startPage.path, startPage.template, 'utf8');
            resolve(true);
        }
        catch(err) {
            reject(err);
        }
        
        
    });
}

module.exports = {
    getUserProjectByName,
    createProject
}