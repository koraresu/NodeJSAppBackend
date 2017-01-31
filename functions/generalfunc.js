
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
var PushEvent    = model.pushevent;
var Push         = model.push;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Pushfunc = require('./pushfunc');

var apn = require('apn');

var options = {
  token: {
    key: "conf/key.p8",
    keyId: "822637C6D9",
    teamId: "58GA47LFA6",
  },
  cert: "conf/cert.pem",
  production: true,
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
exports.profile_equal = function(profileID, profiles){
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
exports.sendPushtoAll = function(type,profileId, message, payload, success, fail){
	Pushfunc.addOrGet(type, message._id, profileId, function(pushEvent){
		Device.find({ profile: profileId }).populate('profile').exec(function(err, deviceData){

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
						sendPushOne(item.token, name, mensaje, payload, function(result){
							callback(null, result);
						}, function(result){
							callback(null, result);
						});
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
function sendPushOne(deviceToken, name, message, payload,  success, fail){
	var mensaje = name + ": " + message;
	if(payload == undefined){
		payload = {};
	}
	if(success == undefined){
		success = function(result){};
	}
	if(fail == undefined){
		fail = function(result){};
	}

	var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = 1;
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
exports.mensaje_create = mensaje_create
exports.sendPushOne = sendPushOne