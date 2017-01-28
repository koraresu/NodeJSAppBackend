
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
var Message      = model.message;
var Push         = model.push;
var PushEvent    = model.pushevent;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

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
	addOrGet(0, id, profile, function(pushEventData){
		success(pushEventData);
	}, function(){
		fail();
	});
}
function NotAddOrGet(id, profile, success, fail){
	addOrGet(1, id, profile, function(pushEventData){
		success(pushEventData);
	}, function(){
		fail();
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

	
	PushEvent.findOne(search).exec(function(err, pushEventData){
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
			fail();
		}
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
exports.addOrGet    = addOrGet;
exports.add         = add;
exports.createPush  = createPush;