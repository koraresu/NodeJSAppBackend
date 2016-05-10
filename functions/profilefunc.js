
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

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
		var split = birthday.split("/");
		var datebirth = Date(split[2],split[1],split[0],0,0,0,0);

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