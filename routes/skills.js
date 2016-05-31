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
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');



var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
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
					func.response(200, skills, function(response){
						res.json(response);
					});
				});
			break;
			default:
				func.response(113, {},function(response){
					res.json(response);
				});
			break;
		}
	});
});
router.post('/add', multipartMiddleware, function(req, res){
	var guid             = req.body.guid;
	var name             = req.body.name;

	Tokenfunc.toProfile(guid, function(status, userData, profileData, profileInfoData){
		switch(status){
			case 200:
				Skillfunc.add(profileData._id,name, function(status, skillData, profileData){
					func.response(200, profileData , function(response){
						res.json(response);
					});
				});
			break;
			default:
				func.response(113, {},function(response){
					res.json(response);
				});
			break;
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
					console.log(index+"|"+(x.length-1)+"|"+item)
					Skillfunc.add(profileData._id,item, function(status, skillData, profileData){

						if((x.length-1) == index){

							func.response(200, profileData, function(response){
								res.json(response);
							});
						}
					});
				})
			break;
			default:
				func.response(113, {},function(response){
					res.json(response);
				});
			break;
		}
	});
})

module.exports = router;