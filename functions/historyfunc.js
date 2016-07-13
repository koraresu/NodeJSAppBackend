
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');
var History            = require('../models/history');

exports.generate_history = function(type, profileData, data, cb){
	console.log(data);
	profile_id = data.profile;

	switch(type){
		case "1":
			// data: {
			// title: "",
			// content: "",
			// gallery: []
			// }
			new_history = new History({
				"profile_id": profileData._id,
				"action": type,
				"data": {
					"gallery": data.gallery,
					"content": data.content,
					"title": data.title
				}
			});

		break;
		case "2":
		// data: {
		// puesto: "",
		// puesto_id: ""
		// }
		new_history = new History({

			"action": type,
			"profile_id": profileData._id,

			"data" : {
				"puesto" : data.puesto,
				"puesto_id" : data.puesto_id
			}
		});
		break;
		case "3":
			// data: {
			// 	profile: {} <- Perfil Otro
			// }
			new_history = new History({
				"profile_id": profileData._id,
				"de_id": data.profile._id,
				"action": type,
				"data": {}
			});
		break;
		case "4":
			// data: {
			// busqueda: ""
			// }
			new_history = new History({
				"profile_id": profileData._id,
				"action": type,
				"data": {
					"busqueda": data.busqueda
				}
			});
		break;
		case "5":
			// data: {
			// title: "",
			// content: "",
			// gallery: []
			// }
			new_history = new History({
				"profile_id": profileData._id,
				"de_id": data.profile._id,
				"action": type,
				"data": {
					"gallery": data.gallery,
					"content": data.gallery,
					"title": data.gallery,
				}
			});
		break;
		case "6":
			// data: {
			// skill_name: "",
			// skill_id: ""
			// }
			new_history = new History({
				"profile_id": profileData._id,
				"action": type,
				"data": { 
					"name": data.name,
					"id" : data._id
				}
			});
		break;
		case "7":

			// data: {
			// title: "",
			// content: "",
			// rate: ""
			// }
			new_history = new History({
				"profile_id": profileData._id,
				"de_id": profile_id,
				"action": type,
				"data": { 
					"content": data.content,
					"title": data.title,
					"rate": data.rate
				}
			});
		break;
		default:
			new_history = new History({
				"acion": type,
				"profile_id": profileData._id,
				"de_id": data.profile._id,
			});
		break;
	}
	new_history.save(function(errHistory, historyData){
		cb(historyData);
	});
}

exports.insert = function(data, callback){
	History.findOne({}).sort('-id_numerico').exec(function(err, c){
		console.log(err);
		console.log(c);
		if( c == null){
			data.id_numerico = 0;	
		}else{
			data.id_numerico = c.id_numerico+1;
		}
		
		var new_history = new History(data);
		new_history.save(function(errHistory, historyData){
				callback(errHistory, historyData);
		});
	});
	
}