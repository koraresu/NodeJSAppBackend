
var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');

var faker = require('faker');
faker.locale = "es_MX";
var mongoose    = require('mongoose');
/*
	Nombre de Modelos:
		Toda las variables de modelo se nombrara, con el nombre del archivo, eliminando _ 
		y cambiando la siguiente letras al _ por mayuscula. Iniciando la primera letra en mayuscula.
*/

var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');


var Profile     = require('../models/profile');
var User        = require('../models/user');
var Token       = require('../models/token');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
var Network     = require('../models/network');

router.post('/friend/get', multipartMiddleware, function(req, res){
	var profile_id      = mongoose.Types.ObjectId(req.body.profile_id);
	Profilefunc.PublicId(profile_id, function(err, profileData, profileInfoData, experiencesData){
		var data = {
			profile: profileData,
			profile_info: profileInfoData,
			experiences: experiencesData
		};
		func.response(200, data, function(response){
			res.json(response);
		});
	});
});


router.post('/message', multipartMiddleware, function(req, res){
	var text = req.body.text;
	var profile_a = req.body.a_profile;
	var profile_a = req.body.b_profile;
});
router.post('/check/conversation', multipartMiddleware, function(req, res){
	var text = req.body.text;
	var profile_a = req.body.a_profile;
	var profile_b = req.body.b_profile;


	Networkfunc.checkconversation(profile_a,profile_b, function(status, conversationData){

		func.response(200, conversationData, function(response){
			res.json(response);
		})
	});
});

/*
router.post('/search', multipartMiddleware, function(req, res){
	var search = req.body.search;
	var reg  = new RegExp(search, "i");
	var data = [];
	func.searchProfile(reg, function(status, profileData){
		profileData.forEach(function(item, index, array, done) {
			data.push(item);
			if(index == (profileData.length-1)){
				func.response(200, {"mi": data}, function(response){
					res.json(response);
				})
			}
		});
	});
});
*/

router.post('/search', multipartMiddleware, function(req, res){
	var text = req.body.search;
	Experience.find({ $text: { $search: text }}, function(err, experiencesData){
		res.send(err);
		//res.json(experiencesData);
	})
});
router.post('/qrcode', multipartMiddleware, function(req, res){
	var guid = req.body.guid;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			console.log("Token");
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				Profilefunc.generate_qrcode(profileData);
				res.json({
					file: '/qrcode/'+profileData._id+'.png',
					public_id: profileData.public_id
				});
			});
		}else{

		}
	});
});
router.post('/generate/history',multipartMiddleware, function(req, res){
	var type = req.body.type;

	var date = new Date();
	// 57486bbe1a47529b08fda17b
	switch(type){
		case "1":
			new History({
				"type": "1",       // Action 
				"title": faker.Lorem.words(),
				"content": faker.Lorem.words(),
				"gallery": [
					{
						"path": "/root/the-hive-server/public/gallery/57705a42d4ff75607874f4e2.png",
						"url": "/gallery/57705a42d4ff75607874f4e2.png"
					},
					{
						"path": "/root/the-hive-server/public/gallery/57705a42d4ff75607874f4e3.png",
						"url": "/gallery/57705a42d4ff75607874f4e3.png"
					},
					{
						"path": "/root/the-hive-server/public/gallery/57705a42d4ff75607874f4e4.png",
						"url": "/gallery/57705a42d4ff75607874f4e4.png"
					},
					{
						"path": "/root/the-hive-server/public/gallery/57705a42d4ff75607874f4e5.png",
						"url": "/gallery/57705a42d4ff75607874f4e5.png"
					}
				],
				"profile": {
					"_id": "5738e9ef817c37df1ca03725",
					"first_name": "Juan",
					"last_name": "Corrales",
					"profile_pic": "5738e9ef817c37df1ca03725.png",
					"public_id": "574f58a61ab6bbed7cd340e7",
					"speciality": {
						"name": "Comercio Internacional",
						"id": "574c68aed6fcbf6f0690bb52"
					}
				},
				"date": "2016-06-26T22:42:10.115Z"
			});
		break;
		case "2":
		break;
		case "3":
		break;
		case "4":
		break;
		case "5":
		break;
		case "6":
		break;
		case "6":
		break;
		default:
		break;
	}
});
router.post('/generate', multipartMiddleware, function(req,res){
	for(var i = 0;i<=50;i++){
		var nombre   = faker.name.firstName();
		var apellido = faker.name.lastName();
		var email    = faker.internet.email();
		var password = faker.internet.password();

		func.userProfileInsertIfDontExists({
			email: email
			//email: "programacion2@axovia.mx"
		},{
			email: email,
			password: password,
			verified: true,
			status: Math.floor(Math.random() * (2 - 0 + 1)) + 0
		},{
			first_name: nombre,
			last_name: apellido,
			nacimiento: null,
			ocupation: {},
			speciality: {},
			public_id: mongoose.Types.ObjectId(),
			experiences: []
		}, function(exist, tokenData,profileData){

			var max = 10;
			var min = 1;
			var rand = Math.floor(Math.random() * (max - min + 1)) + min;
			console.log(nombre+" "+apellido);
			for(var x = 0;x<=rand;x++){
				console.log(x);

				Profile.findOne().skip(x).exec(function(statusRandF, profileRandF){
					if(!statusRandF && profileRandF){
						var accepted = false;
						if(Math.random()%2){
							accepted = true;
						}
						var network = new Network({
							accepted: accepted,
							profiles: [
								profileData._id,
								profileRandF._id
							]
						});
						console.log(network);

						network.save(function(err, networkData){
														
						});
					}
					
				});
			}

			if(i == 50){
				res.send("Creado");
			}
		});
	}
});
module.exports = router;