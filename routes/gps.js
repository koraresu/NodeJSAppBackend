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
var Networkfunc  = require('../functions/networkfunc');
var Generalfunc  = require('../functions/generalfunc');


exports.find = function(socket, callback){
	console.log(socket);
	var meters      = 120;
	var km          = meters/1000;
	var maxDistance = km / 111;
	/*
	var maxDistance = 5;
	maxDistance /= 6371;
	*/

	var limit = 8;

	Location.findOne({
		socket: socket
	}).exec(function(err, locationSocket){
		console.log(err);
		console.log("Location Socket Before");
		console.log(locationSocket);
		if(!err && locationSocket){

			Location.find({
 				coordinates: {
 					$near: locationSocket.coordinates,
 					$maxDistance: maxDistance 
 				},
 				socket: {
 					$ne: socket
 				}
 			}).limit(limit).populate('profile').exec(function(err, locationData){
 				async.map(locationData, function(item, cb){
 					Networkfunc.isFriend(locationSocket.profile, item.profile._id, function(status){
 						if(status){
 							cb(null, null);
 						}else{
 							cb(null, item);
 						}
 					});
 				}, function(err, results){
 					results = Generalfunc.cleanArray(results);
 					callback(err, results);
 				});
 			});

		}else{
			callback(err, null);
		}
		
	});
}
exports.delete = function(socket, callback){
	Location.remove({ socket: socket }).exec(function(err){
		callback(err, socket);
	});
}
exports.set = function(guid, gps, socket, callback){
	
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
							locationData.socket      = socket;
						}else{
							locationData = new Location({
								coordinates: coordinates, 
								profile: profileData._id,
								socket: socket
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
exports.invite = function(guid, public_id, item, result, mensajes){
	Tokenfunc.exist(guid, function(status, tokenData){
      if(status){
        Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
          if(status){

            if(mongoose.Types.ObjectId.isValid( public_id )){
              public_id = mongoose.Types.ObjectId( public_id );
              Profile.findOne({ public_id: public_id }).exec(function(errProfile, profileData){
                GPS.find({
                  profile: profileData
                }).exec(function(errGPS, gpsData){
                  async.map( gpsData, item, result);
                });
              });
            }else{
            	mensajes.no_usuario();
            }
          }else{
          	mensajes.no_perfil();
          }
        });
      }else{
      	mensaje.no_token();
      }
    });
}