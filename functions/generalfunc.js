
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');

exports.saveImage = function(file, new_path, callback){
	var tmp_path         = file.path;
	var extension = path.extname(tmp_path);
	fs.rename(tmp_path, new_path, function(err){
		fs.unlink(tmp_path, function(err){
			callback();
		});
	});
}
exports.response = function(type,item, callback){
	switch(type){
		case 101:
			callback({ status: 'error', message: "No Permitido", data: item});
		break;
		case 200:
			callback({ status: 'success', message: "Success", data: item});
		break;
		case 201:
			callback({ status: 'logged', message: "Welcome", data: item });
		break;
		case 111:
			callback({ status: 'error', message: "User Or Password Does't Exists.", data: item});
		break;
		case 112:
			callback({ status: 'error', message: "User Exists", data: item});
		break;
		case 113:
			callback({ status: 'error', message: "Profile No Existe", data: item});
		break;
		case 404:
			callback({ status: 'error', message: "Not Found", data: item});
		break;
	}
}