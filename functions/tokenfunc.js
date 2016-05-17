
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


exports.toProfile = function(guid, callback){
	Token.findOne({ generated_id: guid}).exec(function(errToken, token){
		if(!errToken && token){
			User.findOne({ _id: token.user_id }, function(errUser, user){
				if(!errUser && user){
					user['password'] = null;
					delete user['password'];
					Profile.findOne({ user_id: user._id }).populate('experiences','skills').exec(function(errProfile, profile){
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
exports.exist = function(guid, callback){
	Token.findOne({ generated_id: guid}, function(errToken, token){
		if(!errToken && token){
			callback(true, token);
		}else{
			callback(false, null);
		}
		
	});
}