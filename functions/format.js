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
exports.news = function(news, profile){
	console.log("NEWS");
	console.log(news);
	console.log("/NEWS");
	switch(news.action){
		case 1:
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
		case 2:
			return {
				"type": "2",       // Action 
				"puesto": "Gerente de piso",
				"profile": profile,
				"date": "2016-06-26T22:42:10.115Z"
			};
		break;
		case 3:
			return {

			};
		break;
		case 4:
			return {

			};
		break;
		case 5:
			return {

			};
		break;
		case 6:
			return {

			};
		break;
		case 7:
			return {

			};
		break;
	}
	
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