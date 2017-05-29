
var express = require('express');
var router = express.Router();

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

var Profilefunc    = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc      = require('../functions/tokenfunc');
var Skillfunc      = require('../functions/skillfunc');
var Historyfunc    = require('../functions/historyfunc');

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
			
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				Profilefunc.generate_qrcode(profileData, function(profileData){
					res.json({
						file: '/qrcode/'+profileData._id+'.png',
						public_id: profileData.public_id
					});
				});
				
			});
		}else{

		}
	});
});
router.post('/generate/history',multipartMiddleware, function(req, res){
	var type = req.body.type;

	Profile.find().exec(function(err, profileData){
		profileData.forEach(function(profileData, index){
			Network.find({
				profiles: {
					"$in": [profileData._id]
				}
			}).count().exec(function(err, count){
				
				var random = Math.floor(Math.random() * count);

				Network.findOne().skip(random).exec(function(err, friend){
					var uno = friend.profiles[0]._id;
					var dos = friend.profiles[1]._id;

					var profile_id;
					if(uno == profileData._id){
						profile_id = friend.profiles[1];
					}else{
						profile_id = friend.profiles[0];
					}

					Historyfunc.generate_history("7", profileData, {
						"gallery": [],
						"content": faker.lorem.words(10),
						"title": faker.lorem.words(5),
						"profile": profile_id
					}, function(err, history){
						
						
						Historyfunc.generate_history("2", profileData, {
							"puesto" : faker.lorem.words( 2 ),
							"profile": profile_id
						}, function(err, history){
							Historyfunc.generate_history("3", profileData, {
								"profile": profile_id
							}, function(err, history){
								
								Historyfunc.generate_history("4", profileData, {
									"busqueda": faker.lorem.words( 2 ),
									"profile": profile_id
								}, function(err, history){
									
							
										
										Historyfunc.generate_history("6", profileData, {
											"name": faker.lorem.words(2),
											"profile": profile_id
										}, function(err, history){
											
											Historyfunc.generate_history("7", profileData, {
												"content": faker.lorem.words( 10 ),
												"title": faker.lorem.words(5),
												"rate": faker.random.number( 5 ),
												"profile": profile_id
											}, function(err, history){
												
											});
										});
								
								});
							});
						});
						
					});
				});
			});
		});
	});
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
			
			for(var x = 0;x<=rand;x++){
				

				Profile.findOne({ _id: {"$ne": profileData._id } }).skip(x).exec(function(statusRandF, profileRandF){
					if(!statusRandF && profileRandF){
						var accepted = false;
						if(Math.random()%2){
							accepted = true;
						}

						if(profileData._id != profileRandF._id){
							var network = new Network({
								accepted: accepted,
								profiles: [
									profileData._id,
									profileRandF._id
								]
							});
							

							network.save(function(err, networkData){
															
							});
						}
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