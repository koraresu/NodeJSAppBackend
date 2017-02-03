
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _jade = require('jade');
var async = require('async');

var model = require('../model');
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
var Device       = model.device;
var Online       = model.online;
var PushEvent    = model.pushevent;
var Push         = model.push;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Tokenfunc = require('./tokenfunc');
var Pushfunc = require('./pushfunc');

var apn = require('apn');

var options = {
  token: {
    key: "conf/key.p8",
    keyId: "822637C6D9",
    teamId: "58GA47LFA6",
  },
  //production: false
  production: true
};
var apnProvider = new apn.Provider(options);


var nodemailer = require('nodemailer');
var smtpConfig = {
	host: 'mail.thehiveapp.mx',
	port: 26,
	secure: false,
	tls:  {
		rejectUnauthorized: false
	},
	auth: {
		user: 'hola@thehiveapp.mx',
		pass: 'axovia es lo mejor'
	}
};
/*
var smtpConfig = {
  host: "mailtrap.io",
  port: 2525,
  auth: {
    user: "fea6a54f8a714a",
    pass: "e977cec06a0b1d"
  }
};
*/
var transporter    = nodemailer.createTransport(smtpConfig,{
	debug: true
});
var sendMail = function(toAddress, subject, content, next){
	//console.log("SmtpConfig:")
	//console.log(smtpConfig);
	var mailOptions = {
		from: "hola@thehiveapp.mx",
		to: toAddress,
		subject: subject,
		html: content,
		list: {
			unsubscribe: {
            	url: 'http://thehiveapp.mx:3000/unsubscribe?email='+toAddress,
            	comment: 'Comment'
        	}
		}
	};
	//console.log("Mail Options:");
	//console.log(mailOptions);

	transporter.sendMail(mailOptions, function(error, info){
		//console.log("Email: [Error]");
		//console.log(error);
  	
		//console.log("Email: [Info]");
		//console.log(info);

		return next();
	});
}; 

exports.apnProvider = function(){
	return apnProvider;
}

exports.saveImage = function(file, new_path, callback){
	var tmp_path         = file.path;
	var extension = path.extname(tmp_path);
	fs.rename(tmp_path, new_path, function(err){
		fs.unlink(tmp_path, function(err){
			callback();
		});
	});
}
exports.response = function(type,item, callback){
	switch(type){
		case 200:
			callback({ status: 'success', code: type, message: "Success", data: item});
		break;
		case 201:
			callback({ status: 'logged', code: type, message: "Welcome", data: item });
		break;
		case 101:
			callback({ status: 'error', code: type, message: "No Permitido", data: item});
		break;
		case 111:
			callback({ status: 'error', code: type, message: "Email y/o contraseña es incorrecto", data: item});
		break;
		case 112:
			callback({ status: 'error', code: type, message: "El correo electrónico ya fue utilizado.", data: item});
		break;
		case 113:
			callback({ status: 'error', code: type, message: "Perfil inexistente", data: item});
		break;
		case 114:
			callback({ status: 'error', code: type, message: "No Son Amigos", data: item});
		break;
		case 404:
			callback({ status: 'error', code: type, message: "No encontrado", data: item});
		break;
		default:
			callback({ status: 'unknown', code: type, message: item.message, data: item.data});
		break;
	}
}
exports.cleanArray = function(actual) {
	var newArray = new Array();
	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}
	return newArray;
}
exports.sendEmail = function(file, data,email, asunto, callback){
	
	
	var template = process.cwd() + '/views/';
	template+= file;
	fs.readFile(template, 'utf8', function(err, file){
		if(err){
			cb(false);
		}else {
			var compiledTmpl = _jade.compile(file, {filename: template});
			var context = data;
			var html = compiledTmpl(context);
			sendMail(email, asunto, html, function(err, response){				
				if(err){
					callback(false);
				}else{
					callback(true, html);
				}
			});
    	}	
  	});
  	
}
exports.capitalize = function(s){
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
};
exports.precise_round = function(num, decimals) {
	var t = Math.pow(10, decimals);
	var result = (Math.round((num * t) + (decimals>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
	return result/1;
}
exports.profile_ajeno = function(profileID,profiles){

	//console.log("ProfileID:");
	//console.log( profileID );

	var first  = profiles[0];
	var second = profiles[1];

	//console.log("First:");
	//console.log( first );

	//console.log("Second:");
	//console.log( second );


	if(first._id.toString() == profileID.toString()){
		return second;
	}else{
		return first;
	}
}
exports.sendPush = function(device, payload, message, badge, sound, ca){
	if(sound == undefined || sound == null){
		sound = "ping.aiff";
	}
	var note = new apn.Notification();
	var deviceToken = device;
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = badge;
	note.sound = sound;
	note.alert = message;
	note.payload = payload;
	note.topic = "com.thehiveapp.thehive";
	apnProvider.send(note, deviceToken).then( (result) => {
		console.log( result );
		if(result.failed[0] != undefined){
			if(result.failed[0].error != undefined){
				console.log( result.failed[0].error );
			}
		}
    	ca(result);
	});
}
exports.isValid = function(id, success, fail){
	if(mongoose.Types.ObjectId.isValid(id)){
		success(mongoose.Types.ObjectId(id));
	}else{
		fail();
	}
}
function profile_equal(profileID, profiles){
	var first  = profiles[0];
	var second = profiles[1];

	var element;
	var number = -1;
	if(first._id.toString() == profileID.toString()){
		element = first;
		number = 0;
	}else{
		element = second;
		number = 1;
	}
	return { number: number, profile: element };
}

exports.profile_equal = profile_equal;
exports.sendPushtoAll = function(type,profileId, message, payload, success, fail){
	Pushfunc.addOrGet(type, message._id, profileId, function(pushEvent){
		Device.find({ profile: profileId }).populate('profile').sort({ $natural: -1 }).exec(function(err, deviceData){

			var mensaje = "";

			if(type == 0){
				mensaje = message.message;
			}else{
				mensaje = mensaje_create(message);
			}
			var name = deviceData.profile.first_name + " " + deviceData.profile.last_name;
			async.map(deviceData, function(item, callback){
				if(item.token == ""){
					callback(null, null);
				}else{
					console.log( item.token );
					Pushfunc.createPush(pushEvent._id, item.token, function(){
						var badge = 1;
						callback(null, item);
					}, function(){
						callback(null, null);
					});
					
				}
			}, function(err, results){
				success(err, results);
			});
		});
	}, function(err){
		fail(err);
	});
}
function sendPushOne(deviceToken,badge, name, message, payload,  success, fail){
	var mensaje = name + ": " + message;
	if(!Number.isInteger(badge)){ badge = 1; }
	if(payload == undefined){ payload = {}; }
	if(success == undefined){ success = function(result){}; }
	if(fail == undefined){ fail = function(result){}; }
	var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = badge;
	note.sound = "ping.aiff";
	note.alert = mensaje;
	note.payload = payload;
	note.topic = "com.thehiveapp.thehive";
	apnProvider.send(note, deviceToken).then( (result) => {
		if(result.status == "200"){
  			success({r: result, device:  deviceToken});
		}else{
			fail(result);
		}
	});
}
function mensaje_create(data, nombre_emisor, nombre_mensaje){
	switch(data.tipo){
		case 0: //0 = se ha unido
		message = "¡Tu contacto " + nombre_emisor + " se ha unido! ";
		clase   = "unio";
		break;
		case 1: //1 = recomendación
		message = nombre_emisor + " te recomienda a " + nombre_mensaje;
		clase   = "recomendacion";
		break;
		case 2: //2 = share contacto
		message = nombre_emisor + " quiere enviar tu contacto a "+nombre_mensaje;
		clase   = "share";
		break;
		case 3: //3 = Envio Solucitud
		if(data.clicked == 1){
			if(data.status == 1){
				message = "Tu y " + nombre_emisor + " están conectados";
				clase   = "accept";
			}else{
				message = "No aceptaste la solicitud de " + nombre_emisor;
				clase   = "accept";
			}
		}else{
			message = nombre_emisor + " te quiere contactar";
			clase   = "connect";
		}
		break;
		case 4: //4 = Respondio Solicitud
		message = nombre_emisor + " te añadió";
		clase   = "accept";
		break;
		default:
		message = "";
		clase   = "";
		break;
	}
	return { mensaje: message, class: clase };
}
function NotificationReaded(data, success, fail){
	var notification_id = data.notification;

	if(mongoose.Types.ObjectId.isValid( notification_id )){
		notification_id = mongoose.Types.ObjectId( notification_id );
		PushEvent.find({ type: 1, notification: notification_id }).exec(function(errPushEvent, pushEventData){
			async.map(pushEventData, function(item, callback){
				item.read = true;
				item.save(function(err, pushevent){
					if(!err && pushevent){
						callback(null, item);	
					}else{
						callback(err, null);
					}
				});
			}, function(err, results){
				if(!err){
					success(results);
				}else{
					fail(err);
				}
				
			});
		});
	}
}
function MessageReaded(data, success, fail){
	var conversation_id = data.conversation;

	if(mongoose.Types.ObjectId.isValid( conversation_id )){
			conversation_id = mongoose.Types.ObjectId( conversation_id );
			Conversation.findOne({ _id: conversation_id }).exec(function(errConversation, conversationData){
				Message.find({ conversation: conversationData._id })
				.populate('profile_id')
				.exec(function(errMessage, messageData){
					async.map(messageData, function(item, callback){
						PushEvent.findOne({ message: item._id }).exec(function(errPushEvent, pushEventData){
							if(!errPushEvent && pushEventData){
								console.log( pushEventData );

								pushEventData.read = true;
								pushEventData.save(function(errPushE, pushEData){
									if(!errPushEvent && pushEData){
										callback(null, pushEData);
									}else{
										callback(errPushEvent, null);
									}
								});	
							}else{
								callack("A", null);
							}

							






						});
					}, function(err, results){
						if(!err){
							success(results);
						}else{
							fail(err);
						}
					});
				});
			});
		
	}
}
function SocketNoReaded(socket, success, fail){
	Online.findOne({ socket: socket.id }).exec(function(errOnline, onlineData){
		console.log("Online:" + socket.id );
		if(!errOnline && onlineData){
			NoReaded(onlineData.profiles, success, fail);	
		}else{
			console.log("Online Error:");
			console.log( errOnline );
		}
	});
}
function NoReaded(profile_id, success, fail){
	console.log("ProfileID No Readed:");
	console.log( profile_id );
	if(profile_id._id != undefined){
		profile_id = profile_id._id;
	}
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId(profile_id);
		PushEvent.find({ profile: profile_id, read: false }).exec(function(err, pushEventData){
			if(!err && pushEventData){
				console.log("PushEventData No Readed:");
				console.log( pushEventData );
				console.log("PushEventData No Readed Length:");
				console.log(pushEventData.length);
				success(pushEventData.length);
			}else{
				fail(1);
			}
		});
	}else{
		console.log("Invalid Profile ID");
		fail(0);
	}
}
function profiletosocket(profile_id, callback){
	Online.find({ profiles: profile_id }).exec(function(errOnline, onlineData){
		if(!errOnline && onlineData){
			if(onlineData.length > 0){
				async.map(onlineData, function(item, ca){
					ca(null, item.socket);
				}, function(err, results){
					callback(null, results);
				});	
			}else{
				callback(errOnline, []);	
			}
		}else{
			callback(errOnline, []);
		}
	});

}
exports.SocketNoReaded     = SocketNoReaded;
exports.NoReaded           = NoReaded;
exports.profiletosocket    = profiletosocket;
exports.NotificationReaded = NotificationReaded;
exports.MessageReaded      = MessageReaded;
exports.mensaje_create     = mensaje_create
exports.sendPushOne        = sendPushOne