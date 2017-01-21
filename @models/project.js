var mongoose = require('mongoose');
var Account  = require('./account');

var Schema = mongoose.Schema; 

var Project = new Schema({
    name: String,
    belongsTo: {type:Schema.Types.ObjectId,ref:'Account'},
    isDeployed: Boolean,
    createdOn: {type:Date, default:Date.now}
});

module.exports = mongoose.model('Project', Project);
