var express             = require('express');
var router              = express.Router();
var func                = require('../func'); 
var multipart           = require('connect-multiparty');
var multipartMiddleware = multipart();

var mongoose    = require('mongoose');

var Profile     = require('../models/profile');
var User        = require('../models/user');
var Token       = require('../models/token');
var ProfileData = require('../models/profile_data');
var Job         = require('../models/job');
var Company     = require('../models/company');
var ProfileHive = require('../models/profile_hive');


/***************************************************
*                                                  *
*   Profile Create                                 *
*   - Code                                         *
*      - 0:                                        *
*      - 1: Perfil Creado Correctamente.           *
*      - 2: El Email ya existe.                    *
*   Add New Data                                   *
*   - Create                                       *
*      - 0:                                        *
*      - 1:                                        *
*      - 2:                                        *
*                                                  *
****************************************************/
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
	var nombre   = req.body.firstname;
	var apellido = req.body.lastname;
	var email    = req.body.email;
	var password = req.body.password;
	func.userProfileInsertIfDontExists({
		email: email
	},{
		email: email,
		password: password,
		verified: false
	},{
		firstname: nombre,
		lastname: apellido,
	}, function(exist, tokenData){
		if(exist){
			func.response(112,{
				token: tokenData.generated_id
			}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	func.tokenExist(guid, function(errToken, token){
		if(!errToken && token){
			func.tokenToProfile(token, function(status, userData, profileData, profileInfoData){
				switch(status){
					case 200:
						func.response(200, { 
							user: userData,
							profile: profileData,
							token: tokenData.generated_id,
							data: profileInfoData
						}, function(response){
							res.json(response);
						});	
					break;
					case 111:
						func.response(111, {}, function(response){
							res.json(response);
						});
					break;
				}
			});
		}else{
			func.response('101', function(response){
				res.json(response);
			});
		}
	});
});
router.post('/update', multipartMiddleware, function(req, res){

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
