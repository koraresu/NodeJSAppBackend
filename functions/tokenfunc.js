/**
 * Helpers de Token.
 *
 * @module Helpers
 */
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var model = require('../model');
var Profile     = model.profile;
var User        = model.user;
var Token       = model.token;
var Job         = model.job;
var Company     = model.company;
var Experience  = model.experience;
var Network     = model.network;
var History     = model.history;
var Feedback    = model.feedback;
var Review      = model.review;
var Log         = model.log;
var Skill       = model.skill;
var Speciality  = model.speciality;
var Sector      = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;


exports.toProfile = function(guid, callback){
	Token.findOne({ generated_id: guid}).exec(function(errToken, token){
		if(!errToken && token){
			User.findOne({ _id: token.user_id }, function(errUser, user){
				if(!errUser && user){
					user['password'] = null;
					delete user['password'];
					Profile.findOne({ user_id: user._id }).populate('experiences','skills').exec(function(errProfile, profile){
						if(!errProfile && profile){
							//ProfileInfo.find({ profile_id: profile._id }, function(errProfileInfo, profileinfo){
								callback(200,user, profile);
							//});
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
exports.exist2Callback = function(guid, success, fail){
	Token.findOne({ generated_id: guid}, function(errToken, token){
		if(!errToken && token){
			success( token );
		}else{
			fail();
		}
	});
}