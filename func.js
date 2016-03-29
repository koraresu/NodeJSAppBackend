var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hive');

var User  = require('./models/user');
var Profile  = require('./models/profile');
var Token  = require('./models/token');
var PSkills  = require('./models/pskills');

exports.generate_id = function(){
    
}
