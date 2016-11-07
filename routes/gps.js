var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mongoose    = require('mongoose');
var _ = require('underscore');
var async = require('async');
var router = express.Router();

var model              = require('../model');

var Profile      = model.profile;
var User         = model.user;
var Token        = model.token;
var Job          = model.job;
var Company      = model.company;
var Experience   = model.experience;
var Network      = model.network;
var History      = model.history;
var Feedback     = model.feedback;
var Review       = model.review;
var Log          = model.log;
var Skill        = model.skill;
var Speciality   = model.speciality;
var Sector       = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;
var Location     = model.location;

var Tokenfunc    = require('../functions/tokenfunc');
var Profilefunc  = require('../functions/profilefunc');


exports.find = function(gps, profile, callback){
	var profile;

	if(mongoose.Types.ObjectId.isValid(profile)){
		profile = mongoose.Types.ObjectId(profile);
	}

	var limit = 10;

    // get the max distance or set it to 8 kilometers
    var maxDistance = 8;

    // we need to convert the distance to radians
    // the raduis of Earth is approximately 6371 kilometers
    maxDistance /= 6371;
	Location.find({ 
		coordinates: {
			$near: gps,
			$maxDistance: maxDistance 
		},
		profile: {
        	$ne: profile
    	}
	}).limit(4).populate('profile').exec(function(err, locationData){
		callback(err, locationData);
	});
}
exports.delete = function(guid, gps, callback){

}
exports.set = function(guid, gps, callback){
	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					var locationData;
					Location.findOne({ profile: profileData._id }).exec(function(err, locationData){
						
						var coordinates = [];
						coordinates[0] = gps.lat;
						coordinates[1] = gps.lng;

						if(!err && locationData){
							locationData.coordinates =  coordinates;
						}else{
							locationData = new Location({
								coordinates: coordinates, 
								profile: profileData._id
							});

						}
						locationData.save(function(err, local){
							Location.findOne({ _id: locationData._id }).exec(function(err, locationData){
								callback(false, locationData);
							});
						});

						if(!err && locationData){

							callback(false, locationData);
						}else{
							
							
						}
					});
				}else{
					callback(true,null);
				}
			});
		}else{
			callback(true,null);
		}
	});
}