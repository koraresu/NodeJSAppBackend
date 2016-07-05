
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



	switch(type){
		case "1":
			// data: {
			// title: "",
			// content: "",
			// gallery: []
			// }
			new_history = new History({
				"profile_id": profileData._id,
				"de_id": profileData._id,
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
			"de_id": profileData._id,

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
				"de_id": profileData._id,
				"action": type,
				"data": {
					"busqueda": faker.lorem.words(2)
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
				"de_id": profile_id,
				"action": type,
				"data": {
					"gallery": gallery,
					"content": content,
					"title": title
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
				"de_id": profileData._id,
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
					"content": faker.lorem.words(10),
					"title": faker.lorem.words(5),
					"rate": faker.random.number( 5 )
				}
			});
		break;
		default:
			new_history = new History({
				"profile_id": profileData._id,
				"de_id": profile_id,
			});
		break;
	}

	new_history.save(function(errHistory, historyData){
		cb(historyData);
	});

}