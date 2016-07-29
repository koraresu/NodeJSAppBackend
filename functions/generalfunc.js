
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _jade = require('jade');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');



var nodemailer = require('nodemailer');

var smtpConfig = {
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'rkenshin21@gmail.com',
		pass: 'Alse21988'
	}
};
var smtpConfigtrap = {
	host: 'mailtrap.io',
	port: 25,
	secure: false,
	auth: {
		user: 'fea6a54f8a714a',
		pass: 'e977cec06a0b1d'
	}
};

var transporter    = nodemailer.createTransport(smtpConfig,{
//var transporter    = nodemailer.createTransport(smtpConfigtrap,{
	debug: true
});
var sendMail = function(toAddress, subject, content, next){
  var mailOptions = {
    to: toAddress,
    subject: subject,
    html: content
  };
  transporter.sendMail(mailOptions, function(error, info){
  	console.log(error);
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
			callback({ status: 'error', code: type, message: "User Exists", data: item});
		break;
		case 113:
			callback({ status: 'error', code: type, message: "Profile No Existe", data: item});
		break;
		case 114:
			callback({ status: 'error', code: type, message: "No Son Amigos", data: item});
		break;
		case 404:
			callback({ status: 'error', code: type, message: "Not Found", data: item});
		break;
		default:
			callback({ status: 'unknown', code: type, message: "Not Found", data: item});
		break;
	}
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