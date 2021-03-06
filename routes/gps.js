/**
 * Son las funciones usadas por los sockets para la conexiones con el GPS.
 *
 * @module Socket.
 */
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

var Tokenfunc         = require('../functions/tokenfunc');
var Profilefunc       = require('../functions/profilefunc');
var Networkfunc       = require('../functions/networkfunc');
var Notificationfunc  = require('../functions/notificationfunc');
var Generalfunc       = require('../functions/generalfunc');

/**
 * Route "/conversations", Listar las Conversaciones del Perfil
 * @param {String} guid, Token del Perfil(permiso).
 * @return {Object} Acceso a el Objeto de la Libreria de Apple Push Notification ya configurada.
 *
 */
exports.find = function(socket, callback){
	
	var meters      = 500;
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
};
/**
 * Route "/conversations", Listar las Conversaciones del Perfil
 * @param {String} guid, Token del Perfil(permiso).
 * @return {Object} Acceso a el Objeto de la Libreria de Apple Push Notification ya configurada.
 *
 */
exports.delete = function(socket, callback){
	Location.remove({ socket: socket }).exec(function(err){
		callback(err, socket);
	});
};
/**
 * Route "/conversations", Listar las Conversaciones del Perfil
 * @param {String} guid, Token del Perfil(permiso).
 * @return {Object} Acceso a el Objeto de la Libreria de Apple Push Notification ya configurada.
 *
 */
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
};
/**
 * Route "/conversations", Listar las Conversaciones del Perfil
 * @param {String} guid, Token del Perfil(permiso).
 * @return {Object} Acceso a el Objeto de la Libreria de Apple Push Notification ya configurada.
 *
 */
exports.invite = function(guid, public_id, itemFunc, resultFunc, mensajes){
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileMeData, profileInfoData){
				if(status){

					if(mongoose.Types.ObjectId.isValid( public_id )){
						public_id = mongoose.Types.ObjectId( public_id );
						Profile.findOne({ public_id: public_id }).exec(function(errProfileFriend, profileFriendData){
							Location.find({
								profile: profileFriendData._id
							}).exec(function(errGPS, gpsData){

								async.map( gpsData, function(item,callback){
									var d = { profile: profileMeData, friend: profileFriendData };
									itemFunc(d, item);
									callback(null, d);
								}, function(err, results){
									resultFunc(results);
								});
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
};
/**
 * Route "/conversations", Listar las Conversaciones del Perfil
 * @param {String} guid, Token del Perfil(permiso).
 * @return {Object} Acceso a el Objeto de la Libreria de Apple Push Notification ya configurada.
 *
 */
exports.connect = function(profileData, profileAnotherData, status, callback, io){
	var find = {
		"profiles": {
			"$all": [
			profileData._id,
			profileAnotherData._id
			]
		}
	};
	Network.findOne(find, function(errNetwork, network){

		if(!errNetwork && network){
			network.accepted = true;
		}else{
			var network = new Network({
				accepted: true,
				profiles: [
				profileData._id,
				profileAnotherData._id
				]
			});
		}
		network.save(function(err, networkData){
			Network.findOne({ _id: networkData._id}).populate('profiles').exec(function(errNetwork, networkData){
				Notificationfunc.add({
					tipo: 3,
					profile: profileAnotherData._id,
					profile_emisor: profileData._id,
					network: networkData._id,
					clicked: false,
					status: false,
				}, function(status, notificationData){
					var data = {
						"network": networkData,
						"profile": profileData, 
						"friend": profileAnotherData
					};
					
					Location.findOne({
						profile: profileData._id
					}).exec(function(errLoc, locData){
						
						
						
						callback(data, locData);
					});
				}, io);
			});
		});
		
	});
};
