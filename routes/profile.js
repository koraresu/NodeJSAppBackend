var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

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

/*
Nombre de Objectos de Documentos:
	Todo dato recibido por FUNC, que sea un documento de mongo, se le colocara como nombre de varible el nombre del modelo,
	seguido de la palabra "Data"*Respetando Mayusculas*, se cambio el modelo ProfileData a ProfileInfo para no tener problemas.

*/
router.post('/login', multipartMiddleware, function(req, res){
	var email    = req.body.email;
	var password = req.body.password;

	func.userProfileLogin(email, password, function(userData, tokenData){
		if(userData){
			func.response(201,{
				token: tokenData.generated_id
			}, function(response){
				res.json(response);
			});
		}else{
			func.reponse(111, function(response){
				res.json(response);
			});
		}
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
					//res.send("True");
					var data = {
						user: userData,
						profile: profileData,
						profile_info: profileInfoData
					};

					func.response(200, data, function(response){
						res.json(response);
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

	var nombre    = req.body.nombre;
	var apellido  = req.body.apellido;
	var phone     = req.body.phone;

	res.send("Update");
});
/*
router.post('/update', multipartMiddleware, function(req, res){
	var guid  = req.body.guid;

	Token.findOne({ generated_id: guid }, function(errToken, guid){
		var token = guid;
		if(!errToken && guid){
			User.findOne({ _id: guid.user_id}, function(errUser, user){
				var account = user;
				if(!errUser && user){
					Profile.findOne({ user_id: account._id}, function(errProfile, perfil){
						var profile = perfil;
						if(!errProfile && perfil){
							var data = {
									name: {
										first: perfil.name.first, 
										last: perfil.name.last
									},
									email: account.email,
									token: token.generated_id,
									extra: {}
							};

							ProfileData.find({ user_id: account._id }, function(errProfileData, perfildata){
								if(!errProfileData && perfildata){
									data.extra = new Array();
									perfildata.forEach(function(pdata){
										data.extra.push({
											type: pdata.tipo,
											value: pdata.data
										});
										res.json(data);
									});
								}else{
									res.json({status: {code: 2 , message: "Perfil no existe"} });
								}
								

								
							});
						}else{
							res.json({status: {code: 3 , message: "Perfil no existe"} });
						}
						
					});
				}else{
					res.json({status: {code: 4 , message: "Usuario no existe."} });
				}
			});
		}else{
			res.json({status: {code: 5 , message: "Este token no existe"} });
		}
	});
});

*/
module.exports = router;
