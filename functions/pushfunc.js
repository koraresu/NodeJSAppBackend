
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var _jade = require('jade');
var fs = require('fs');
var async = require("async");
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
var Online       = model.online;
var Device       = model.device;
var Push         = model.push;
var Message      = model.message;
var PushEvent    = model.pushevent;
var City         = model.city;
var Country      = model.country;

var Generalfunc = require('./generalfunc');

function prepare(profile_id, message_id, success, fail){
	APNfunc.prepare(profile_id, message_id, success, fail);
}
function add(d, success, fail){
	APNfunc.add(d, success, fail);
}
function addOrGet(type, id, profile, success, fail){
	APNfunc.addOrGet(type, id, profile, success, fail);
}
function createPush(pushEvent, token,dItem, success, fail){
	var badge = 0;
	var d = {
		device: token,
  		push: pushEvent
	};
	var p = new Push(d);
	p.save(function(err, pushData){
		if(!err && pushData){
			Push.findOne({ _id: pushData._id }).exec(function(err, pushData){
				var name = "";
				if(pushEvent.type == 1){
					var notificationItem = dItem;
					name = pushEvent.profile.first_name + " " + pushEvent.profile.last_name;
					Notification.findOne({ _id: pushEvent.notification })
					.populate('profile')
					.populate('profile_emisor')
					.populate('profile_mensaje')
					.exec(function(err, notificationData){
						
						
						
						
						var nombre_emisor = "";
						var nombre_mensaje = "";

						if(notificationData.profile_emisor != undefined){
							nombre_emisor = notificationData.profile_emisor.first_name + " " + notificationData.profile_emisor.last_name;
						}
						if(notificationData.profile_mensaje != undefined){
							nombre_mensaje = notificationData.profile_mensaje.first_name + " " + notificationData.profile_mensaje.last_name;	
						}
						message = Generalfunc.mensaje_create(notificationData, nombre_emisor, nombre_mensaje);
						badge = 1;
						Generalfunc.NoReaded(pushEvent.profile, function(num){
							badge = num;
							Generalfunc.sendPushOne(token.token, badge, name, message, {
								type: pushEvent.type,
								notification: notificationData
							}, function(results){
								success(results);
							}, function(results){
								success(results);
							});
						}, function(){
							Generalfunc.sendPushOne(token.token, badge, name, message, {
								type: pushEvent.type,
								notification: notificationData
							}, function(results){
								success(results);
							}, function(results){
								success(results);
							});
						});
						
					});
					
				}else{
					var messageItem = dItem;
					name = "";
					if(messageItem != undefined){
						if(messageItem.profile_id != undefined){
							name = messageItem.profile_id.first_name + " " + messageItem.profile_id.last_name;
						}
					}
					Message.findOne({ _id: pushEvent.message }).exec(function(err, messageData){
						message = messageData.message;
						badge = 1;
						Generalfunc.NoReaded(pushEvent.profile, function(num){
							badge = num;
							Generalfunc.sendPushOne(token.token,badge, name, message, {
								type: pushEvent.type,
								conversation: messageData.conversation
							}, function(results){
								success(results);
							}, function(results){
								success(results);
							});
						}, function(){
							Generalfunc.sendPushOne(token.token,1, name, message, {
								type: pushEvent.type,
								conversation: messageData.conversation
							}, function(results){
								success(results);
							}, function(results){
								success(results);
							});
						});
					});
				}
			});
		}else{
			fail(err);
		}
	});
}
function eventsetReaded(data, success, fail){
	if(data.type == 0){
		var conversation      = data.conversation;
		Message.find({
			conversation: conversation._id
		}).exec(function(err, messageData){
			async.map(messageData, function(item, callback){
				callback( null, item._id );
			}, function(err, results){
				PushEvent.find({
					type: 0,
					read: false,
					message: {
						$in: results
					}
				}).exec(function(err, pushEventData){
					async.map(pushEventData, function(i, c){
						PushEvent.findOne({ _id: i._id }).exec(function(errPushEventI, pushEventIData){
							pushEventIData.read = true;
							pushEventIData.save(function(eSave, saveData){
								c(eSave, saveData);
							});
						});
					}, function(errPush, pushResult){
						success(pushResult);
					})
				});
			});
		});
	}else{
		success();
	}
}
function send(type, profile_id, dItem, success, fail){
	var message_id = dItem._id;

	var device = [];
	prepare(profile_id, message_id, function(profile_id,message_id){
		addOrGet(type, message_id, profile_id, function(pushEventData){

			get_devices(profile_id, function(item, cb){
							
				APNfunc.tokenItem(item.token, function(token){
					cb(null, token);
				});

			}, function(err, results){
				results = Generalfunc.cleanArray( results );
				sendMultiple(function(data){
					success(null, data );
				},results, mensaje.mensaje, dItem);
			});
		}, function(err){
			fail(1);
		});
	}, function(profile_id,message_id){
		fail(0);
	});
}
function getNotProfile(id, socket, success, fail){
	Notification.findOne({ _id: mongoose.Types.ObjectId(id) })
	.populate('profile')
	.populate('profile_emisor')
	.populate('network')
	.exec(function(err, notificationData){
		
		if(!err && notificationData){
			Online.findOne({ socket: socket.id }).populate('profiles').exec(function(errOnline, onlineData){
				if(!errOnline && onlineData){
					success( notificationData.profile_emisor );
				}else{
					fail(1);
				}
			});
		}else{
			fail(0);
		}
	});
}
function getConvProfile(id, socket,success, fail){
	
	

	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId(id);
		Message.findOne({ _id: id})
		.populate('profile_id')
		.populate('conversation')
		.exec(function(errMessage, messageData){

		if(!errMessage && messageData){
			Conversation.findOne({ _id: messageData.conversation._id }).populate('profiles').exec(function(errConversation, conversationData){
				if(!errConversation && conversationData){
					Online.findOne({ socket: socket.id }).populate('profiles').exec(function(errOnline, onlineData){
						if(!errOnline && onlineData){
							var profiles = conversationData.profiles;
							var profile = onlineData.profiles;
							var ajeno = Generalfunc.profile_ajeno(profile._id, profiles);
							success(ajeno);
						}else{
							fail(3);
						}
					});
				}else{
					fail(2);
				}
			});
		}else{
			fail(1);
		}				
	});	
	}else{
		fail(0);
	}
}
exports.eventsetReaded = eventsetReaded;
exports.prepare    = prepare;
exports.add        = add;
exports.addOrGet   = addOrGet;
exports.createPush = createPush;
exports.send       = send;
exports.getNotProfile = getNotProfile;
exports.getConvProfile = getConvProfile;