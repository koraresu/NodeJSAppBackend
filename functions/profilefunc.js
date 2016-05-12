
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Generalfunc = require('./generalfunc');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var ProfileInfo        = require('../models/profile_info');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');

exports.getAll           = function(){

}
exports.get              = function(){

}
exports.insert           = function(){

}
exports.update           = function(profile_id, first_name, last_name, birthday, callback){
	Profile.findOne({ _id: profile_id}, function(err, profileData){
		var split = birthday.split("-");
		var day = split[2];
		var month = split[1];
		month = month-1;
		var year = split[0];

		console.log(day)
		console.log(month)
		console.log(year)

		var datebirth = new Date(year,month,day);

		profileData.first_name = first_name;
		profileData.last_name  = last_name;
		profileData.birthday   = datebirth;
		profileData.save(function(err, profileData){
			if(!err && profileData){
				callback(true, profileData);	
			}else{
				callback(false, profileData);
			}
		});
	});
}
exports.updateProfilePic = function(profile_id, file, callback){
	var extension       = path.extname(file.path);
	var file_pic        = profile_id + extension;
	var new_path   = path.dirname(path.dirname(process.mainModule.filename)) + '/public/profilepic/' + file_pic;

	Generalfunc.saveImage(file, new_path, function(){
		Profile.findOne({ _id: profile_id}, function(err, profileData){

			profileData.profile_pic  = file_pic;
			profileData.save(function(err, profileData){
				callback(err,profileData);
			});
		});
	});
	
}
exports.updateSkills     = function(profile_id, callback){

}
exports.updateInfo       = function(profile_id, callback){

}
exports.updateExperience = function(profile_id, callback){

}
function tokenToProfile(guid, callback){
	Token.findOne({ generated_id: guid}).exec(function(errToken, token){
		if(!errToken && token){
			User.findOne({ _id: token.user_id }, function(errUser, user){
				if(!errUser && user){
					user['password'] = null;
					delete user['password'];
					console.log(user);
					Profile.findOne({ user_id: user._id }).exec(function(errProfile, profile){
						console.log()
						if(!errProfile && profile){
							ProfileInfo.find({ profile_id: profile._id }, function(errProfileInfo, profileinfo){
								callback(200,user, profile, profileinfo);
							});
						}else{
							callback(101);
						}
						
					});
				}else{
					callback(111, null, null, null);
				}
			});
		}else{
			callback(101, null, null, null);
		}
	});
}
exports.tokenToProfile = tokenToProfile