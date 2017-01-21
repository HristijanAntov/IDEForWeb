var express  = require('express');
var passport = require('passport');
var Account  = require('../@models/account');
var Project  = require('../@models/project');
var path     = require('path');
var fs       = require('fs');


var router = express.Router();

router.get('/', function (req, res) {
    
    if(req.user){
       Project.find({belongsTo:req.user._id},function(err,projects){
           
           
           res.render('index', {user:req.user,projects:projects});
       })
    }
    else{
       res.render('index', { user : req.user});      
    }
  
});

router.get('/register', function(req, res) {
    res.render('register', {});
});

router.post('/register', function(req, res) {
    
    Account.register(new Account({
             username : req.body.username ,
             livesIn: req.body.livesIn,
             occupation:req.body.occupation ,
             aboutMe: req.body.aboutMe 
             }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }
        fs.mkdirSync(path.join(__dirname, '..', 'projects', account._id.toString()));
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;