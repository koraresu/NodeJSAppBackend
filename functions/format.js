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
	console.log("NEWS");
	console.log(news);
	console.log("/NEWS");
	switch(news.action){
		case "1":
			return {
				"id": news._id,
				"type": news.action,
				"title": news.data.title,
				"content": news.data.content,
				"gallery": news.data.gallery,
				"profile": profile,
				"date": news.createdAt
			};
		break;
		case "2":
			return {
				"type": "2",       // Action 
				"puesto": news.data.puesto,
				"profile": profile,
				"date": news.createdAt
			};
		break;
		case "3":
			return {
				"type": "3",       // Action 
				"titulo": "Jennifer Pérez y Juan López",
				"profile": profile,
				"date": news.createdAt
			};
		break;
		case "4":
			return {
				"type": "4",       // Action 
				"busqueda": news.data.busqueda,
				"profile_friend": profile_de,
				"profile": profile,
				"date": news.createdAt
			};
		break;
		case "5":
			return {
				"id": news._id,
				"type": news.action,
				"title": news.data.title,
				"content": news.data.content,
				"gallery": news.data.gallery,
				"profile": profile,
				"date": news.createdAt
			};
		break;
		case "6":
			return {
				"id": news._id,
				"type": "6",
				"skill": news.data.busqueda,
				"profile": profile,
				"date": news.createdAt
			};
		break;
		case "7":
			return {
				"type": "7",       // Action 
				"title": "Titulo",
				"content": "Probando",
				"rate": "5",
				"profile": profile,
				"date": news.createdAt
			};
		break;
		default:
			return {
				"profile": profile,
				"date": news.createdAt
			};
		break;
	}	
}
exports.feedback = function(feedback){
	return {
		"title": feedback.title,
		"content": feedback.content,
		"date": feedback.createdAt
	};
}
exports.littleProfile = function(profile){
	console.log(profile);
	/*
	
	*/
	if(typeof profile == "undefined" || profile == null){
		return {};
	}else{
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
	}
	
}