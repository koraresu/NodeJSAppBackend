var express = require('express');
var router = express.Router();
var func = require('../func'); 
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
var Profile     = require('../models/profile');
var User        = require('../models/user');
var Token       = require('../models/token');
var ProfileInfo = require('../models/profile_info');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
/*
Nombre de Objectos de Documentos:
	Todo dato recibido por FUNC, que sea un documento de mongo, se le colocara como nombre de varible el nombre del modelo,
	seguido de la palabra "Data"*Respetando Mayusculas*, se cambio el modelo ProfileData a ProfileInfo para no tener problemas.

*/
router.post('/login', multipartMiddleware, function(req, res){
	var email    = req.body.email;
	var password = req.body.password;

	func.userProfileLogin(email, password, function(status, tokenData, userData, profileData){
		console.log(tokenData);
		console.log(userData);
		console.log(profileData);
		func.experienceGet(profileData._id, function(statusExperience, experiences){
			var exp = statusExperience;

			if(status){
				var verified = false;

				if(userData.verified){
					verified = true;
				}
				func.response(201,{
					token: tokenData.generated_id,
					verified: verified,
					experiences: exp,
				}, function(response){
					res.json(response);
				});
			}else{
				func.reponse(111,{ },function(response){
					res.json(response);
				});
			}
		});
	});
});
router.post('/friend/get', multipartMiddleware, function(req, res){
	var profile_id      = req.body.profile_id;
	func.ProfileId(profile_id, function(err, profileData, profileInfoData, experiencesData){
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
router.post('/create', multipartMiddleware, function(req, res){
	var nombre   = req.body.first_name;
	var apellido = req.body.last_name;
	var email    = req.body.email;
	var password = req.body.password;
	func.userProfileInsertIfDontExists({
		email: email
	},{
		email: email,
		password: password,
		verified: false
	},{
		first_name: nombre,
		last_name: apellido,
		nacimiento: null
	}, function(exist, tokenData){
		if(exist){
			func.response(112,{}, function(response){
				res.json( response );
			});
		}else{
			console.log(tokenData);
			func.response(200,{
				token: tokenData.generated_id
			},function(response){
				res.json( response );
			} );
		}
	});
});
router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	func.tokenExist(guid, function(status, tokenData){
		if(status){
			func.tokenToProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					func.experienceGet(profileData._id, function(statusExperience, experiencesData){
						var data = {
							user: userData,
							profile: profileData,
							profile_info: profileInfoData,
							experiences: experiencesData
						};

						func.response(200, data, function(response){
							res.json(response);
						});
					});
					
				}else{
					func.response(113,{},function(response){
						res.json(response);
					});
				}
			});
		}else{
			res.send("No Token");
		}
	});
});
router.post('/update', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	var nombre    = req.body.first_name;
	var apellido  = req.body.last_name;

	var company    = req.body.company;
	var job        = req.body.job;
	var speciality = req.body.speciality;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;

	var birthday   = req.body.birthday;

	console.log(nombre)
	console.log(apellido)
	console.log(company)
	console.log(job)
	console.log(speciality)
	console.log(sector)
	console.log(ocupation)
	console.log(birthday)
	func.tokenExist(guid, function(status, tokenData){
		if(status){
			func.tokenToProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				Experience.findOne({ profile_id: tokenData._id }, function(err, experienceData){
					ex
				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			})
		}
	});
	res.send("Update");
});
router.post('/verify', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	func.tokenExist(guid, function(status, tokenData){
		if(status){
			func.tokenToProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				var verified = false;

				if(userData.verified){
					verified = true;
				}
				func.response(200,{	
					verified: verified
				}, function(response){
					res.json(response);
				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/setprofilepic', multipartMiddleware, function(req, res){
	var guid             = req.body.guid;
	var profile_pic      = req.files.profilepic;
	var profile_pic_hive = req.files.profilepic_hive;

	console.log(profile_pic);
	console.log(profile_pic);

	var tmp_path         = profile_pic.path;
	var tmp_hive_path    = profile_pic_hive.path;

	func.tokenExist(guid, function(status, tokenData){
		if(status){
			func.tokenToProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				var extension       = path.extname(tmp_path);
				var extension_hive  = path.extname(tmp_hive_path);
				var file_pic        = profileData._id + extension;
				var file_hivepic    = profileData._id + "_hive" + extension_hive;
				var new_path        = path.dirname(path.dirname(process.mainModule.filename)) + '/public/profilepic/' + file_pic;
				var new_hive_path   = path.dirname(path.dirname(process.mainModule.filename)) + '/public/profilepic/' + file_hivepic;

				var path_image      = req.get('host') + '/profilepic/' + file_pic;
				var path_image_hive = req.get('host') + '/profilepic/' + file_hivepic;

				func.saveImage(profile_pic, new_path, function(){
					func.saveImage(profile_pic_hive, new_hive_path, function(){

						profileData.profile_pic  = file_pic;
						profileData.profile_hive = file_hivepic;
						profileData.save();
						func.response(200, {
							profilepic: path_image,
							profilepic_hive: path_image_hive
						},function(response){
							res.json(response);
						});
					});
				});
			});
		}else{
			func.response(101,{},function(response){
				res.json(response);
			});
		}
	});
});
router.post('/search', multipartMiddleware, function(req, res){
	var text = req.body.search;
	Experience.find({ $text: { $search: text }}, function(err, experiencesData){
		res.send(err);
		//res.json(experiencesData);
	})
});
module.exports = router;
