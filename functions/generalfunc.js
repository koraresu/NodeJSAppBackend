
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _jade = require('jade');

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
	console.log("SmtpConfig:")
	console.log(smtpConfig);
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
	console.log("Mail Options:");
	console.log(mailOptions);

	transporter.sendMail(mailOptions, function(error, info){
		console.log("Email: [Error]");
		console.log(error);
  	
		console.log("Email: [Info]");
		console.log(info);

		return next();
	});
}; 


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
			callback({ status: 'unknown', code: type, message: "Se ha producido un Error", data: item});
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