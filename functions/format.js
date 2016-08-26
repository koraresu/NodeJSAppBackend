var express = require('express');

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

exports.chat_message = function(message){
	return {
		"_id": message._id,
		"date": message.createdAt,
		"profile_id": message.profile_id,
		"conversation": message.conversation,
		"message": message.message
	};
}
exports.news = function(news, profile, profile_de){

	console.log(profile);
	
	profile_de = news.de_id;

	switch(news.action){
		case "1":
			console.log(news.id_numerico);

			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": news.action,
				"title": news.data.title,
				"content": news.data.content,
				"gallery": news.data.gallery,
				"profile": profileNewsFormat(profile),
				"date": news.createdAt
			};
		break;
		case "2":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "2",       // Action 
				"puesto": news.data.puesto,
				"profile": profileNewsFormat(profile),
				"date": news.createdAt
			};
		break;
		case "3":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "3",       // Action 
				"titulo": profile.first_name+" "+profile.last_name+" y "+profile_de.first_name+" "+profile_de.last_name,
				"profile": profileNewsFormat(profile),
				"date": news.createdAt
			};
		break;
		case "4":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "4",       // Action 
				"busqueda": news.data.busqueda,
				"profile": profileNewsFormat(profile),
				"profile_friend": profileNewsFormat(profile_de),
				"date": news.createdAt
			};
		break;
		case "5":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": news.action,
				"title": news.data.title,
				"content": news.data.content,
				"gallery": news.data.gallery,
				"profile": profileNewsFormat(profile),
				"date": news.createdAt
			};
		break;
		case "6":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "6",
				"skill": news.data.name,
				"profile": profileNewsFormat(profile),
				"date": news.createdAt
			};
		break;
		case "7":
		
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "7",       // Action 
				"title": news.data.title,
				"content": news.data.content,
				"rate": news.data.rate,
				"profile": profileNewsFormat(profile),
				"profile_friend": profileNewsFormat(profile_de),
				"date": news.createdAt
			};
		break;
		default:
			return {
				"id_n": news.id_numerico,
				"profile": profileNewsFormat(profile),
				"date": news.createdAt
			};
		break;
	}
	
}
exports.notification = function(notification){
	var data = {
		tipo: notification.tipo,
		date: notification.createdAt
	};
	if(typeof notification.busqueda != "undefined"){
		data.busqueda = notification.busqueda;	
	}
	return data;
}
exports.feedback = function(feedback){
	return {
		"title": feedback.title,
		"content": feedback.content,
		"date": feedback.createdAt
	};
}
exports.user = function(user){

}
exports.login = function(tokenData, verified, exp){
	return {
		token: tokenData.generated_id,
		verified: verified,
		experiences: exp,
	};
}
function friendProfileFormat(profile){
	if(typeof profile == "undefined" || profile == null){
		return {};
	}else{
		return {
			"id": profile._id,
			"first_name": profile.first_name,
			"last_name": profile.last_name,
			"public_id": profile.public_id,
			"skills": profile.skills,
			"experiences": profile.experiences,
			"profile_pic": profile.profile_pic,
			"speciality": profile.speciality,
			"status": profile.status
		};
	}
}
function MyProfileQueryFormat(query, callback){
	if(typeof profile == "undefined" || profile == null){
		var data = {};
		callback(data);
	}else{
		query.populate('experiences').populate('skills').populate('user_id','-password').exec(function(errProfile, perfil){
			var data = [];
			perfil.forEach(function(profile, index){
				var d = {
					"id": profile._id,
					"first_name": profile.first_name,
					"last_name": profile.last_name,
					"public_id": profile.public_id,
					"skills": profile.skills,
					"experiences": profile.experiences,
					"profile_pic": profile.profile_pic,
					"speciality": profile.speciality,
					"status": profile.status
				};
				data.push(d);

				if(perfil.length == index+1){
					console.log(data);
					callback(data);
				}
			});
				 
		});
	}
	
}
function MyProfileFormat(profile, callback){
	if(typeof profile == "undefined" || profile == null){
		var data = {};
		callback(data);
	}else{
		Profile.findOne({ _id: profile._id }).populate('experiences').populate('skills').populate('user_id','-password').exec(function(errProfile, profile){
			var data = {
				"id": profile._id,
				"first_name": profile.first_name,
				"last_name": profile.last_name,
				"public_id": profile.public_id,
				"skills": profile.skills,
				"experiences": profile.experiences,
				"profile_pic": profile.profile_pic,
				"speciality": profile.speciality,
				"status": profile.status
			};
			callback(errProfile, data);
		});
	}
	
}
function profileNewsFormat(profile){
	if(typeof profile == "undefined" || profile == null){
		return {};
	}else{
			return {
				"id": profile._id,
				"first_name": profile.first_name,
				"last_name": profile.last_name,
				"public_id": profile.public_id,
				"skills": profile.skills,
				"experiences": profile.experiences,
				"profile_pic": profile.profile_pic,
				"qrcode": profile.qrcode,
				"speciality": profile.speciality,
				"status": profile.status
			};
	}
	
}
function profileformat(profile){
	if(typeof profile == "undefined" || profile == null){
		return {};
	}else{



		Profile.findOne({ _id: profile._id})
		.populate('user_id')
		.populate('experiences')
		.populate('skills')
		.exec(function(err, profile){
			return {
				"id": profile._id,
				"first_name": profile.first_name,
				"last_name": profile.last_name,
				"public_id": profile.public_id,
				"skills": profile.skills,
				"experiences": profile.experiences,
				"profile_pic": profile.profile_pic,
				"speciality": profile.speciality,
				"status": profile.status
			};
		});
	}
	
}
exports.profilequeryformat = MyProfileQueryFormat
exports.profileformat = MyProfileFormat
exports.friendProfile = friendProfileFormat
exports.littleProfile = profileformat