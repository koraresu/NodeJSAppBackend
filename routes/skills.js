var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');

var mongoose    = require('mongoose');
/*
	Nombre de Modelos:
		Toda las variables de modelo se nombrara, con el nombre del archivo, eliminando _ 
		y cambiando la siguiente letras al _ por mayuscula. Iniciando la primera letra en mayuscula.
		*/
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



		var Generalfunc    = require('../functions/generalfunc');
		var Profilefunc    = require('../functions/profilefunc');
		var Tokenfunc      = require('../functions/tokenfunc');
		var Skillfunc      = require('../functions/skillfunc');
		var Historyfunc    = require('../functions/historyfunc');
		var Experiencefunc = require('../functions/experiencefunc');
		var Networkfunc    = require('../functions/networkfunc');
		var format         = require('../functions/format.js');
/*
Nombre de Objectos de Documentos:
	Todo dato recibido por FUNC, que sea un documento de mongo, se le colocara como nombre de varible el nombre del modelo,
	seguido de la palabra "Data"*Respetando Mayusculas*, se cambio el modelo ProfileData a ProfileInfo para no tener problemas.

	*/
	router.post('/get', multipartMiddleware, function(req, res){
		var guid             = req.body.guid;
		Tokenfunc.toProfile(guid, function(status, userData, profileData, profileInfoData){
			switch(status){
				case 200:
				Skillfunc.get(profileData._id, function(status, skills){
					Generalfunc.response(200, skills, function(response){
						res.json(response);
					});
				});
				break;
				default:
				Generalfunc.response(113, {},function(response){
					res.json(response);
				});
				break;
			}
		});
	});
	router.post('/add', multipartMiddleware, function(req, res){
		var guid             = req.body.guid;
		var name             = req.body.name;

		Tokenfunc.exist(guid, function(status, tokenData){

			if(status){
				Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
					if(status){

						name = Generalfunc.capitalize(name);
						Skillfunc.add(profileData._id,name, function(status, skillD, profileData){
							console.log("Skill Function");
							console.log(status);
							var da = {};
							var data = {};
							if(skillD.type == 1){
								data = {
									type: skillD.type,
									results: skillD.skills
								};
							}else{
								data = {
									type: skillD.type,
									name: skillD.skill.name,
									id: skillD.skill._id
								};
							
							}
							var da = {
								profile_id: profileData._id,
								action: 6,
								data: {}
							};
							Historyfunc.insert(da, function(err, historyData){
								Profilefunc.formatoProfile(profileData._id,function( profileData ){
									Generalfunc.response(200, profileData , function(response){
										res.json(response);
									});
								});
							});
						});
					}else{
						Generalfunc.response(101, {} , function(response){
							res.json(response);
						});
					}
				});
			}else{
				Generalfunc.response(101, {} , function(response){
					res.json(response);
				});
			}
		});



	});
	router.post('/adds', multipartMiddleware, function(req, res){
		var guid             = req.body.guid;
		var skills           = req.body.name;

		var x = skills.split(",");
		console.log(x);

		Tokenfunc.toProfile(guid, function(status, userData, profileData, profileInfoData){
			switch(status){
				case 200:

				x.forEach(function(item, index){
					console.log(index+"|"+(x.length-1)+"|"+item);

					item = Generalfunc.capitalize(item);
					
					Skillfunc.add(profileData._id, item, function(status, skillData, profileData){

						if((x.length-1) == index){

							Generalfunc.response(200, profileData, function(response){
								res.json(response);
							});
						}
					});
				})
				break;
				default:
				Generalfunc.response(113, {},function(response){
					res.json(response);
				});
				break;
			}
		});
	})

	module.exports = router;