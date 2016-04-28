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
router.post('/add', multipartMiddleware, function(req, res){
	var guid             = req.body.guid;
	var name             = req.body.name;

	func.tokenToProfile(guid, function(status, userData, profileData, profileInfoData){
		switch(status){
			case 200:
				func.skillExistsOrCreate({
					name: name
				}, {
					name: name
				}, function(statusSkill, skillData){
					func.skillProfileExistsOrCreate({
						skill: {
							id: skillData._id
						}
					},{
						skill: {
							id: skillData._id,
							name: skillData.name
						},
						profile: {
							id: profileData._id
						}
					}, function(statusSkillProfile, skillProfileData){
						var data = {
							skill_profile: skillProfileData, 
							skill: skillData
						};
						res.json(data);
					});
					
				});
			break;
			default:
				func.response(type, {},function(response){
					res.json(response);
				});
			break;
		}
	});

	
	
});

module.exports = router;