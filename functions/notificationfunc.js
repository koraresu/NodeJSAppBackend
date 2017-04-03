
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var socket_io    = require('socket.io');
var io           = socket_io();

var format = require('../functions/format');

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

var Generalfunc = require('./generalfunc');

exports.get = function(search, callback){
	model.notification.find(search).populate('profile').populate('profile_emisor').populate('profile_mensaje').populate('busqueda').exec(function(errNotification, notificationData){

		if(!errNotification && notificationData){
			callback(true, notificationData);
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
exports.getOne2Callback = function(search, success, fail){
	model.notification.findOne(search).populate('profile').populate('profile_emisor').populate('profile_mensaje').exec(function(errNotification, notificationData){
		if(!errNotification && notificationData){
			success(notificationData);
		}else{
			fail(0);
		}
	});
}
exports.addOrGet = function(search, d, callback){
	if(d == null){
		callback(false);
	}else{
		Notification.findOne(search).exec(function(err, not){
			if(!err && not){
				if(err == null){
					not.status = d.status;
					not.clicked = d.clicked;
					not.save(function(err, notificationData){
						if(!err && notificationData){
							callback(true, notificationData);
						}else{
							callback(false, notificationData);
						}
					});
				}else{
					var notification = new Notification(d);
					notification.save(function(errNotification, notificationData){
						console.log("Erro Notification:");
						console.log(errNotification);
						if(!errNotification && notificationData){
							callback(true, notificationData);	
						}else{
							callback(false);
						}
					});
				}
			}else{
				var notification = new Notification(d);
				notification.save(function(errNotification, notificationData){
					console.log("Erro Notification:");
					console.log(errNotification);
					if(!errNotification && notificationData){
						callback(true, notificationData);	
					}else{
						callback(false);
					}
				});
			}
		});
		
	}
}
exports.add = function(d, callback){
	if(d == null){
		callback(false);
	}else{
		var x = {};
		if(d.deleted == undefined){
			x = { deleted: false };
			d = Generalfunc.extend({}, x, d);
		}
		if(d.status == undefined){
			x = { status: false };
			d = Generalfunc.extend({}, x, d);
		}
		if(d.clicked == undefined){
			x = { clicked: false };
			d = Generalfunc.extend({}, x, d);
		}

		var notification = new Notification(d);
		notification.save(function(errNotification, notificationData){
			console.log("Erro Notification:");
			console.log(errNotification);
			if(!errNotification && notificationData){
				Notificationfunc.send(notData._id, function(){
					callback(true, notificationData);	
				});
			}else{
				callback(false);
			}
		});
	}
}
exports.click = function(search, stat, success, fail){
	Notification.findOne(search).exec(function(err,notificationData){
		notificationData.clicked = true;
		notificationData.status  = stat;
		notificationData.save(function(err, not){
			console.log(err);
			console.log(not);
			if(!err && not){
				Notification.findOne(search).exec(function(err,notificationData){
					console.log(err);
					console.log(notificationData);
					if(!err && notificationData){
						success(notificationData);
					}else{
						fail(1);
					}
				});
			}else{
				fail(0);
			}
		});
	});
}
function send(id, success){
	Notification.findOne({ _id: id }).populate('profile').populate('profile_emisor').populate('profile_mensaje').populate('network').exec(function(errNotification, notificationData){
		Pushfunc.prepare(notificationData.profile._id, notificationData._id, function(profile_id, notification_id){
			Pushfunc.addOrGet(1, notification_id, profile_id, function(pushEventData){
				Device.find({ profile: profile_id }).sort({ $natural: -1 }).exec(function(err, deviceData){
					Onlines.find({ profiles: profile_id }).sort({ $natural: -1 }).exec(function(errOnline, onlineData){
						async.map(onlineData, function(item, callback){}, function(err, result){
							io.sockets.to(item.socket).emit('notification', notificationData);
						});
					});
				});
			}, function(err){
				console.log( err );
			});
		}, function(profile_id, message_id){
			console.log( profile_id );
			console.log( message_id );
		});
	});
	success();
}
exports.send = send;