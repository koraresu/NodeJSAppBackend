/**
 * Helpers de las Formatos.
 *
 * @module Helpers
 */
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
/**
 * chat_message, Formatear un Mensaje.
 *
 * @param {MessageObject} message, datos de el mensaje a formatear.
 * @return {Object} JSON.
 *
 */
exports.chat_message = function(message){
	
	return {
		"_id": message._id,
		"date": message.createdAt,
		"profile_id": message.profile_id,
		"conversation": message.conversation,
		"message": message.message
	};
};
/**
 * news, Formatear una Noticia.
 *
 * @param {MessageObject} news, datos de las noticias a formatear.
 * @param {ProfileObject} profile, datos de los Perfiles.
 * @return {Object} JSON.
 *
 */
exports.news = function(news, profile, profile_de){
	
	profile_de = news.de_id;

	switch(news.action){
		case "1":

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
				"profile": profileNewsFormat(profile),
				"profile_de": profileNewsFormat(profile_de),
				"date": news.createdAt
			};
		break;
		case "4":
			var busqueda = "";
			if(news.data != undefined){
				if(news.data.busqueda != undefined){
					busqueda = news.data.busqueda;
				}
			}
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "4",       // Action 
				"busqueda": busqueda,
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
				"skills": news.data.results,
				"profile": profileNewsFormat(profile),
				"date": news.createdAt
			};
		break;
		case "6":
			var name = "";
			if(news.data != undefined){
				if(news.data.name != undefined){
					name = news.data.name;
				}
			}
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "6",
				"skill": name,
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
};
/**
 * notification, Formatear una Notificaciones.
 *
 * @param {NotificationObject} notificaciones, datos de las notificaciones a formatear.
 * @return {Object} JSON.
 *
 */
exports.notification = function(notification){
	var data = {
		tipo: notification.tipo,
		date: notification.createdAt
	};
	if(typeof notification.busqueda != "undefined"){
		data.busqueda = notification.busqueda;	
	}
	return data;
};
/**
 * feedback, Formatear una Feedback.
 *
 * @param {FeedbackObject} feedback, datos de las feedback a formatear.
 * @return {Object} JSON.
 *
 */
exports.feedback = function(feedback){
	return {
		"title": feedback.title,
		"content": feedback.content,
		"date": feedback.createdAt
	};
};
/**
 * user, Formatear un Usuario. (***)
 *
 * @param {UserObject} user, datos del usuario a formatear.
 * @return {Object} JSON.
 *
 */
exports.user = function(user){
};
/**
 * login, Formatear Login.
 *
 * @param {TokenObject} tokenData, datos del token a formatear.
 * @param {Boolean} verified, 
 * @param {Array} exp, Datos sobre los Puestos del Perfil.
 * @return {Object} JSON.
 *
 */
exports.login = function(tokenData, verified, exp){
	return {
		token: tokenData.generated_id,
		verified: verified,
		experiences: exp,
	};
};
/**
 * friendProfileFormat, Formatear Amigos.
 *
 * @param {TokenObject} profile, datos del Perfil.
 * @return {Object} JSON.
 *
 */
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
};
/**
 * MyProfileQueryFormat, Formatear un Perfil en base a una query iniciada.
 *
 * @param {TokenObject} query, Consulta.
 * @param {TokenObject} callback
 * @callback {function} callback
 *
 */
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
					
					callback(data);
				}
			});
				 
		});
	}	
};
/**
 * MyProfileFormat, Formatear un Perfil en base a un id.
 *
 * @param {TokenObject} profile, Datos del Perfil a formatear.
 * @param {TokenObject} callback
 * @callback {function} callback
 *
 */
function MyProfileFormat(profile, callback){
	if(typeof profile == "undefined" || profile == null){
		var data = {};
		callback(data);
	}else{
		Profile.findOne({ _id: profile._id })
		.populate('experiences')
		.populate('skills')
		.populate('user_id','-password')
		.exec(function(errProfile, profile){
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
};
/**
 * profileNewsFormat, Formatear un Perfil para las noticias.
 *
 * @param {TokenObject} profile, Datos del Perfil a formatear.
 * @param {TokenObject} callback
 * @callback {function} callback
 *
 */
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
};
/**
 * profileformat, Formatear un Perfil en General.
 *
 * @param {TokenObject} profile, Datos del Perfil a formatear.
 * @param {TokenObject} callback
 * @callback {function} callback
 *
 */
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