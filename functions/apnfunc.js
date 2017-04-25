var mongoose    = require('mongoose');

var async       = require('async');

var model        = require('../model');
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
var Device       = model.device;
var Online       = model.online;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Generalfunc = require('./generalfunc');

function get_devices(profile_id, itemFn, resultFn ){
	Device.find({
		profile: profile_id
	}).exec(function(errDev, devData){
		async.map(devData, itemFn, resultFn);
	});
}
function text_create(collection, data ){
	var prof = profile_notification(collection, data);
	if( collection == "notification"){
		return Generalfunc.mensaje_create(data, prof.profile_emisor, prof.profile_mensaje);	
	}else{
		return { mensaje: data.message };
	}
}
function profile_notification(collection, notData){
	if( collection == "notification"){
		var profile_emisor  = "";
		var profile_mensaje = "";
		if(notData.profile_emisor != undefined){
			if(notData.profile_emisor.first_name != undefined){
				profile_emisor = notData.profile_emisor.first_name + " " + notData.profile_emisor.last_name;  
			}
		}
		if(notData.profile_mensaje != undefined){
			if(notData.profile_mensaje.first_name != undefined){
				profile_mensaje = notData.profile_mensaje.first_name + " " + notData.profile_mensaje.last_name;
			}
		}

		return {profile_emisor: profile_emisor, profile_mensaje: profile_mensaje };
	}else{
		return "PruebaMensaje: ";
	}
}
function sendMessNotification(id, success){
	console.log( id );
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId( id );
		Message.findOne({
			_id: id
		}).populate('profile_id').populate('conversation').exec(function(errMess, messData){
			console.log( messData );

			var profile_id = messData.profile_id._id;
			var profiles = messData.conversation.profiles;

			var index = profiles.indexOf( profile_id.toString());

			if( index > -1 ){
				delete profiles[index];
				profiles = Generalfunc.cleanArray(profiles);
			}
			async.map(profiles, function(item, callback){
				Profile.findOne({ _id: item.toString() }).exec(function(errprof, profData){
					Pushfunc.addOrGet(0, messData._id, profData._id, function(pushEvent){
						get_devices(profData._id, function(item, cb){
							var mensaje = text_create("message",messData);
							var name = "";
							name = profData.first_name + " " + profData.last_name;
							Generalfunc.sendPushOne(item.token, 1, name, mensaje.mensaje, messData, function(data){
								cb(null, data );
							}, function(data){
								cb(null, data );
							});
						}, function(err, results){
							callback(null, results);
						});
					});
				});
			}, function(err, results){
				success(results);
			});
		});
	}
}
function sendNotification(id, sucess){
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId( id );

		Notification.findOne({
			_id: id
		}).populate('profile').populate('profile_emisor').populate('network').populate('profile_mensaje').exec(function(errNot, notData){
			Pushfunc.addOrGet(1, notData._id, notData.profile, function(pushEvent){
				get_devices(notData.profile, function(item, cb){
					var mensaje = text_create("notification",notData);
					Generalfunc.sendPushOne(item.token, 1, "", mensaje.mensaje, notData, function(data){
						cb(null, data );
					}, function(data){
						cb(null, data );
					});
				}, function(err, results){
					sucess( results );
				});
			});
		});
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
					PushEvent.findOne({ _id: pushEventData._id }).populate('profile').exec(function(err, pushEventData){
						success(pushEventData);
					});
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
};
exports.add                  = add;
exports.addOrGet             = addOrGet;
exports.sendMessNotification = sendMessNotification;
exports.sendNotification     = sendNotification;
exports.get_devices          = get_devices;
exports.text_create          = text_create;
exports.profile_notification = profile_notification;