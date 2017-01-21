var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// routes
var authRoutes = require('./routes/auth.routes');

// models
var Account = require('./@models/account');
var Project = require('./@models/project');

// servisi
var UserService = require('./@services/account.service');
var ProjectService = require('./@services/project.service');
var FileService = require('./@services/file.service');
var AuthService = require('./@services/auth.service');

// configuration
var config = require('./config.json');

/* -------------- OD OVDE POCNUVA APLIKACIJATA -----------------*/

var app = express();

app.set('view engine', 'ejs');

app.use(express.static(config.app.public));
app.use(bodyParser.json({ limit: '500kb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')(config.passport));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', authRoutes);

// passport config 
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.all('/*', AuthService.requireAuthentication);

app.get('/edit/:name', (req, res) => {
    var name = req.params.name;
    var userId = req.user._id;

    ProjectService.getUserProjectByName(name, userId)
        .then(function (project) {
            res.render("texteditor", { user: req.user, project: project });
        })
        .catch(function (err) {
            res.send("Ne dozvolen proekt");
        });

});

app.get('/run/:name', (req, res) => {
    var name = req.params.name;
    var userId = req.user._id;

    ProjectService.getUserProjectByName(name, userId)
        .then(function (project) {
            var defaultFile = path.join(__dirname, 'projects', userId.toString(), project.name, 'index.html');
            
            res.sendFile(defaultFile);
        })
        .catch(function (err) {
            res.send('Ups... Nastana greska , se izvinuvame');
        });
});

/* 
   Ova e mnogu vazna ruta !
   gi presretnuva site requesti koi dovagjaat posle  /run/projectName
   so cel index.html fajlot i ostanatite html fajlovi, 
   da moze da gi povlece skriptite i ostanatite 
   resursi koi se baraat od dadeniot proekt)
*/
 
app.get('/run/:name/*', (req, res) => {
    var userId = req.user._id.toString();
    var requestedPath = req.params['0'];  
    
    res.sendFile(requestedPath, {
        root: path.join(__dirname, 'projects', req.user._id.toString(), req.params.name)
    });

});


app.get('/file_structure/:name', (req, res) => {
    var userId = req.user._id.toString();
    var name = req.params.name;
    var _path = path.join(__dirname, 'projects', userId, name);
    
    FileService.transformProjectToJSON(_path, {}, userId)
        .then(function (projectTree) {
            res.send(projectTree);
        });
});

app.post('/projects', (req, res) => {
    var username = req.user.username;
    var name = req.body.projectName;
    var isDeployed = false;
    var belongsTo = req.user._id;
    var createdOn = new Date;

    ProjectService.createProject(username, name, isDeployed, belongsTo, createdOn)
        .then(function (project) {
            res.redirect('/');
        })
        .catch(function (err) {
            res.send(err);
        });
});

// Api za manipulacija na fajlovite vo daden proekt
// TODO: Ubavo bi bilo da go smenam po REST ne samo so post da bidat

app.post('/file/add', (req, res) => {
    var _path = req.body.path;
    var type = req.body.type;

    FileService.addResource(_path, type)
        .then(function(status) {
            res.send(status);
        })
        .catch(function(err) {
            res.send(err);
        });
});

app.post('/file/save', (req, res) => {
    var _path = req.body.path;
    var content = req.body.content;

    FileService.updateContent(_path, content)
        .then(function (status) {
            res.send(status);
        })
        .catch(function (err) {
            res.send(err);
        });

});

app.post('/file/rename', (req, res) => {
    var oldpath = req.body.oldpath;
    var newpath = req.body.newpath;

    FileService.renameResource(oldpath, newpath)
        .then(function (status) {
            res.send(status);
        })
        .catch(function (err) {
            res.send(status);
        });
});

app.post('/file/remove', (req, res) => {
    var _path = req.body.path;

    FileService.removeResource(_path)
        .then(function (status) {
            res.send(status);
        })
        .catch(function (err) {
            res.send(status);
        });
        
});

// Za testiranje na apito

app.get('/user/:id', (req, res) => {
    var id = req.params.id;

    UserService.getUserById(id)
        .then(function (user) {
           res.send({ user: user })
        })
        .catch(function (err) {
            res.send("No Current User with that ID")
        });

});


var connectionString = "mongodb://"+ config.db.username +":"+ config.db.password +"@"+ config.db.host +":"+ config.db.port +"/"+ config.db.dbname;

mongoose.connect(connectionString);
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});