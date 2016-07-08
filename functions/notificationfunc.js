
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');
var format = require('../functions/format');
var model = require('../model');

exports.get = function(search, callback){
	model.notification.find(search).populate('profile').populate('profile_emisor').populate('profile_mensaje').populate('busqueda').exec(function(errNotification, notificationData){
		if(!errNotification && notificationData){
			var data = [];
			if(notificationData.length > 0){
				_.each(notificationData,function(item, index){
					var not = format.notification(item);
					not.profile = format.littleProfile(item.profile);
					if(typeof item.profile_mensaje != "undefined"){
						not.profile_mensaje = format.littleProfile(item.profile_mensaje);
					}
					if(typeof item.profile_emisor != "undefined"){
						not.profile_emisor = format.littleProfile(item.profile_emisor);
					}
					data.push(not);

					if(index == (notificationData.length-1)){
						callback(true, data);
					}
				});
			}else{
				callback(true, data);
			}
			
			
		}else{
			callback(false);
		}
	});
}
exports.getOne = function(search, callback){
	model.notification.findOne(search).populate('profile').populate('profile_emisor').populate('profile_mensaje').exec(function(errNotification, notificationData){
		if(!errNotification && notificationData){
			_.
			callback(true, notificationData);
		}else{
			callback(false);
		}
	});
}
exports.add = function(type, profile_id, data, callback){
	var d;
	switch(type){
		case 0:
			d = {
				tipo: type,
				profile: profile_id,
			};
		break;
		case 1:
			d = {
				tipo: type,
				profile: profile_id,
				profile_emisor: data.profile_emisor,
				profile_mensaje: data.profile_mensaje,
				busqueda: data.busqueda
			};
		break;
		case 2:
			d = {
				tipo: type,
				profile: profile_id,
				profile_emisor: data.profile_emisor,
				profile_mensaje: data.profile_mensaje
			};
		break;
		case 3:
			d = {
				tipo: type,
				profile: profile_id,
				profile_emisor: data.profile_emisor
			};
		break;
		case 4:
			d = {
				tipo: type,
				profile: profile_id,
				profile_emisor: data.profile_emisor
			};
		break;
		default:
			console.log("no type acceptable");
		break;
	}
	if(type <5 || type>0){
		var notification = model.notification(d);
		notification.save(function(errNotification, notificationData){
			if(!errNotification && notificationData){
				callback(true, notificationData);	
			}else{
				callback(false);
			}
		});
	}else{
		callback(false);
	}
}