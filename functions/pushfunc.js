
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
var State        = model.state;
var Country      = model.country;

var Generalfunc = require('./generalfunc');

function prepare(profile_id, message_id, success, fail){
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId( profile_id );
	}else{
		profile_id = null;
	}
	if(mongoose.Types.ObjectId.isValid(message_id)){
		message_id = mongoose.Types.ObjectId( message_id );
	}else{
		message_id = null;
	}

	if(profile_id == null || message_id == null){
		fail(profile_id, message_id);
	}else{
		success(profile_id, message_id);
	}
}
function add(d, success, fail){
	var pushevent = new PushEvent( d );
	pushevent.save(function(err, pushEv){
		if(!err && pushEv){
			success( pushEv );	
		}else{
			fail(err);
		}	
	});
}
function addOrGet(type, id, profile, success, fail){
	var data = {};
	var search = {};
	if(type == 1){
		data = {
			profile: profile,
			read:   false,
			type:  type,
			notification: id
		};
		search = {
			profile: profile,
			type: type,
			notification: id
		};
	}else{
		data = {
			profile: profile,
			read:   false,
			type:  type,
			message: id
		};
		search = {
			profile: profile,
			type: type,
			message: id
		};
	}

	console.log( data );
	console.log( search );
	PushEvent.findOne(search).populate('profile').exec(function(err, pushEventData){
		if(!err && pushEventData){
			if(pushEventData.length > 0){
				success( pushEventData );
			}else{
				add(data, function(pushEventData){
					success(pushEventData);
				}, function(err){
					fail(err);
				});
			}
		}else{
			add(data, function(pushEventData){
				PushEvent.findOne({ _id: pushEventData._id }).populate('profile').exec(function(err, pushEventData){
					success(pushEventData);
				});
			}, function(err){
				fail(err);
			});
		}
	});
}
function createPush(pushEvent, token, success, fail){
	var d = {
		device: token,
  		push: pushEvent
	};
	console.log( d );
	var p = new Push(d);
	console.log( p );
	p.save(function(err, pushData){
		if(!err && pushData){
			Push.findOne({ _id: pushData._id }).populate('message').exec(function(err, pushData){
				var name = pushEvent.profile.first_name + " " + pushEvent.profile.last_name;
				if(pushEvent.type == 1){
					Notification.findOne({ _id: pushEvent.notification._id })
					.populate('profile')
					.populate('profile_emisor')
					.populate('profile_mensaje')
					.exec(function(err, notificationData){
						var nombre_emisor = notificationData.profile_emisor.first_name + " " + notificationData.profile_emisor.last_name;
						var nombre_mensaje = notificationData.profile_mensaje.first_name + " " + notificationData.profile_mensaje.last_name;
						message = Generalfunc.mensaje_create(notificationData, nombre_emisor, nombre_mensaje);
						Generalfunc.sendPushOne(token.token, name, message, {

						}, function(results){
							success(results);
						}, function(results){
							success(results);
						});
					});
					
				}else{
					message = pushEvent.message.message;
					Generalfunc.sendPushOne(token.token, name, message, {

					}, function(results){
						success(results);
					}, function(results){
						success(results);
					});
				}
			});
		}else{
			fail(err);
		}
	});
}
exports.prepare  = prepare;
exports.add      = add;
exports.addOrGet = addOrGet;
exports.createPush = createPush;
/*
function add(d, success, fail){
	var pushevent = new PushEvent( d );
	pushevent.save(function(err, pushEv){
		if(!err && pushEv){
			success( pushEv );	
		}else{
			fail(err);
		}	
	});
}
function CovAddOrGet(id, profile, success, fail){
	console.log( id );
	console.log( profile );

	addOrGet(0, id, profile, function(pushEventData){
		success(pushEventData);
	}, function(){
		fail();
	});
}
function NotAddOrGet(id, profile, success, fail){
	console.log( id );
	console.log( profile );

	addOrGet(1, id, profile, function(pushEventData){
		success(pushEventData);
	}, function(){
		fail();
	});
}

function createPush(pushEvent, token, success, fail){
	var p = new Push({
		device: token,
  		push: pushEvent
	});
	p.save(function(err, pushData){
		if(!err && pushData){
			success(pushData);
		}else{
			fail(err);
		}
	});
}
function getNotProfile(id, socket, success, fail){
	Notification.findOne({ _id: mongoose.Types.ObjectId(id) })
	.populate('profile')
	.populate('profile_emisor')
	.populate('network')
	.exec(function(err, notificationData){
		console.log(err);
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
	Conversation.findOne({ _id: mongoose.Types.ObjectId(id) })
	.populate('profiles')
	.exec(function(errConversation, conversationData){
		console.log(errConversation);
		if(!errConversation && conversationData){
			Online.findOne({ socket: socket.id }).populate('profiles').exec(function(errOnline, onlineData){
				if(!errOnline && onlineData){
					var profiles = conversationData.profiles;
					var profile = onlineData.profiles;
					var ajeno = profile_ajeno(profile._id, profiles);
					success(ajeno);
				}else{
					fail(1);
				}
			});
		}else{
			fail(0);
		}				
	});	
}
exports.getNotProfile = getNotProfile;
exports.getConvProfile = getConvProfile;
exports.NotAddOrGet = NotAddOrGet;
exports.CovAddOrGet = CovAddOrGet;
exports.addOrGet    = addOrGet;
exports.add         = add;
exports.createPush  = createPush;
exports.prepare = prepare;
*/
