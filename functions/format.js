var express = require('express');

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
				"profile": profileformat(profile),
				"date": news.createdAt
			};
		break;
		case "2":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "2",       // Action 
				"puesto": news.data.puesto,
				"profile": profileformat(profile),
				"date": news.createdAt
			};
		break;
		case "3":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "3",       // Action 
				"profile": profileformat(profile),
				"date": news.createdAt
			};
		break;
		case "4":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "4",       // Action 
				"busqueda": news.data.busqueda,
				"profile": profileformat(profile),
				"profile_friend": profileformat(profile_de),
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
				"profile": profileformat(profile),
				"date": news.createdAt
			};
		break;
		case "6":
			return {
				"id_n": news.id_numerico,
				"id": news._id,
				"type": "6",
				"skill": news.data.name,
				"profile": profileformat(profile),
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
				"profile": profileformat(profile),
				"profile_friend": profileformat(profile_de),
				"date": news.createdAt
			};
		break;
		default:
			return {
				"id_n": news.id_numerico,
				"profile": profileformat(profile),
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
function profileformat(profile){
	if(typeof profile == "undefined" || profile == null){
		return {};
	}else{
		/*
		var retorno = {
		"_id": profile._id,
		"first_name": profile.first_name,
		"last_name": profile.last_name,
		"profile_pic": profile.profile_pic,
		"public_id": profile.public_id,
		};
		if(typeof profile.speciality != "undefined"){
			retorno.speciality = {
				"name": profile.speciality.name,
				"id": profile.speciality.id
			};
		}
		return retorno;
		*/
		return {
			"id": profile._id,
			"first_name": profile.first_name,
			"last_name": profile.last_name,
			"public_id": profile.public_id,
			"skills": profile.skills,
			"experiences": profile.experiences,
			"profile_pic": profile.profile_pic,
			"speciality": profile.speciality
		};
	}
	
}
exports.littleProfile = profileformat