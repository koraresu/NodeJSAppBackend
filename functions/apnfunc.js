/**
 * Test File is a file for testing documenation!
 *
 * @module JSDocTesting
 */
var mongoose    = require('mongoose');
var async       = require('async');
var apn = require('apn');

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
var Country      = model.country;
var City         = model.city;
var Push         = model.push;
var PushEvent    = model.pushevent;


var Generalfunc = require('./generalfunc');
var Interfaz    = require('./interfazpushfunc');
var Tokenfunc   = require('./tokenfunc');
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function get_interfaz(){
	return Interfaz;
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function socket_to_profile(socket, success, fail){
	var guid = socket.guid;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				success(profileData);
			});
		}else{
			fail();
		}	
	});
}
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function get_sockets(profile_id, itemFn, resultFn ){
	itemFn = (itemFn == undefined)?function(item, callback){ callback(null, item.token);}:itemFn;
	resultFn = (resultFn == undefined)?function(err, results){ }:resultFn;
	Online.find({
		profiles: profile_id
	}).exec(function(errDev, onlineData){
		async.map(onlineData, itemFn, resultFn);
	});
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function get_devices(profile_id, itemFn, resultFn ){
	itemFn = (itemFn == undefined)?function(item, callback){ callback(null, item.token);}:itemFn;
	resultFn = (resultFn == undefined)?function(err, results){ }:resultFn;
	Device.find({
		profile: profile_id
	}).exec(function(errDev, devData){
		async.map(devData, itemFn, resultFn);
	});
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function text_create(collection, data ){
	var prof = profile_notification(collection, data);
	if( collection == "notification"){
		return Generalfunc.mensaje_create(data, prof.profile_emisor, prof.profile_mensaje);	
	}else{
		return { mensaje: data.message };
	}
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendNot(profile_id, title, payload, badge, success){
	console.log("Send Notification");
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		console.log("Send Notification Valid Profile");
		profile_id = mongoose.Types.ObjectId( profile_id );
		Profile.findOne({
			_id: profile_id
		}).exec(function(errprof, profData){
			console.log("Send Notification Profile Search");
			if(!errprof && profData){
				console.log("Send Notification Profile Search Valid");
				get_devices(profData._id, function(item, cb){
					tokenItem(item.token, function(token){
						cb(null, token );
					});
				}, function(err, results){
					results = Generalfunc.cleanArray( results );
					console.log("Send Notification Get Device", results);
					console.log("Send Notification Num", badge);
					console.log("Send Notification Title", title);
					console.log("Send Notification Payload", payload);

					sendMultiple(function(data){
						console.log("Send Notification sendMultiple", data);
						success( data );
					}, results, title, payload, badge);
				});
			}else{
				success( null );
			}
		});
	}else{
		success(null);
	}
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
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
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendNum(profile_id, num, io, success){
	if(typeof num == "string"){ num = num * 1; };
	if(success == undefined){ success = function(){}; };
	
	

	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId( profile_id );
		Profile.findOne({
			_id: profile_id
		}).exec(function(errprof, profData){
			get_devices(profData._id, function(item, cb){
				tokenItem(item.token, function(token){
					cb(null, token );
				});
			}, function(err, results){
				results = Generalfunc.cleanArray( results );
				var data_send = {
					type: 2
				};
				sendMultiple(function(data){
					success( data );
				}, results, "", data_send, num);
			});
		});
	}else{
		success(null);
	}
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendBadge(profile_id, num,  success){
	if(typeof num == "string"){ num = num * 1; };
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId( profile_id );
		Profile.findOne({
			_id: profile_id
		}).exec(function(errprof, profData){
			
			get_devices(profData._id, function(item, cb){

				tokenItem(item.token, function(token){
					cb(null, token );
				});

			}, function(err, results){
				results = Generalfunc.cleanArray( results );

				var data_send = {
					type: 2
				};
				sendMultiple(function(data){
					success( data );
				}, results, "", data_send, num);
			});
			
		});
	}else{
		success(null);
	}
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendMessNotification(id, success, io){
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId( id );
		Message.findOne({
			_id: id
		})
		.populate('profile_id')
		.populate('conversation')
		.exec(function(errMess, messData){

			var mensaje = text_create("message",messData);
			var profile_id = messData.profile_id._id;
			var profiles = messData.conversation.profiles;

			var index = profiles.indexOf( profile_id.toString());

			if( index > -1 ){
				delete profiles[index];
				profiles = Generalfunc.cleanArray(profiles);
			}

			async.map(profiles, function(item, callback){
				Profile.findOne({
					_id: item.toString()
				}).exec(function(errprof, profData){
					var name = "";
					if(messData.profile_id != undefined){
						name = messData.profile_id.first_name + " " + messData.profile_id.last_name;	
					}
					addOrGet(0, messData._id, profData._id, function(pushEvent){
						get_devices(profData._id, function(item, cb){
							tokenItem(item.token, function(token){
								cb(null, token);
							});
						}, function(err, results){
							results = Generalfunc.cleanArray( results );
							var data_send = {
								type: 0,
								message: messData
							};
							Generalfunc.NoReaded(profData._id, function(num){
								sendMultiple(function(data){
									callback(null, profData );
								},results, name+": "+mensaje.mensaje, data_send, num);
							}, function(){
								sendMultiple(function(data){
									callback(null, profData );
								},results, name+": "+mensaje.mensaje, data);
							});
						});
					});
				});
			}, function(err, results){
				success(results);
			});
		});
	}else{
		success(null);
	}
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendNotification(id, sucess){
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId( id );

		Notification.findOne({
			_id: id
		})
		.populate('profile')
		.populate('profile_emisor')
		.populate('network')
		.populate('profile_mensaje')
		.exec(function(errNot, notData){
			var mensaje = text_create("notification",notData);
			addOrGet(1, notData._id, notData.profile, function(pushEvent){
				get_devices(notData.profile, function(item, cb){

					tokenItem(item.token, function(token){
						cb(null, token);
					});

				}, function(err, results){
					results = Generalfunc.cleanArray( results );
					var data_send = {
						type: 1,
						notification: notData
					};
					Generalfunc.NoReaded(notData.profile, function(num){
						sendMultiple(function(data){
							sucess( notData.profile, num );
						},results, mensaje.mensaje, data_send, num);
					}, function(){
						sendMultiple(function(data){
							sucess( notData.profile, 0 );
						},results, mensaje.mensaje, data_send);
					});
				});
			});
		});
	}
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function add(d, success, fail){
	var pushevent = new PushEvent( d );
	pushevent.save(function(err, pushEv){
		if(!err && pushEv){
			success( pushEv );	
		}else{
			fail(err);
		}	
	});
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
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
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendOne(ca,devices, message, payload, badge, sound){
	if(typeof devices == "string"){
		sendMultiple(ca,devices, message, payload, badge, sound);
	}
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendMultiple(ca, devices, message, payload, badge, sound){
	if(badge == undefined || badge == null){ badge = 1; };
	if(sound == undefined || sound == null || sound == ""){ sound = "ping.aiff"; };
	if(payload == undefined){ payload = {}; };

	payload.badge = badge;
	var note        = new apn.Notification();
	var deviceToken = devices;
	note.expiry     = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge      = badge;
	note.sound      = sound;
	note.alert      = message;
	note.payload    = payload;
	note.topic      = "com.thehiveapp.thehive";

	Generalfunc.apnProvider().send(note, deviceToken).then( (result) => {
		if(result.failed[0] != undefined){
			if(result.failed[0].error != undefined){
				
			}
		}
		ca(result);
	});
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function tokenItem(token, cb){
	if(token == undefined || token == "" || token == null){
		cb(null);
	}else{
		token = token.trim();
		cb(token);
	}	
};

exports.sendNot              = sendNot;
exports.get_interfaz         = get_interfaz;
exports.socket_to_profile    = socket_to_profile;
exports.tokenItem            = tokenItem;
exports.sendMultiple         = sendMultiple;
exports.add                  = add;
exports.addOrGet             = addOrGet;
exports.sendBadge            = sendBadge;
exports.sendNum              = sendNum;
exports.sendMessNotification = sendMessNotification;
exports.sendNotification     = sendNotification;
exports.get_devices          = get_devices;
exports.get_sockets          = get_sockets;
exports.text_create          = text_create;
exports.profile_notification = profile_notification;