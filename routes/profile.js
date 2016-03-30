var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var mongoose   = require('mongoose');

var Profile  = require('../models/profile');
var User  = require('../models/user');
var Token = require('../models/token');
var ProfileData = require('../models/profile_data');



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


router.post('/create',multipartMiddleware,  function(req, res) {

	var nombre   = req.body.nombre;
	var apellido = req.body.apellido;
	var email    = req.body.email;
	var password = req.body.password;
	


	var account;
	var token;
	var profile;
	User.findOne({ email: email}, function(errUser, user){
		if (!errUser && user){
			res.json({status: {code: 2 , message: "Este email ya esta siendo usado."} });
		}else{
			account = new User({
				email: email,
				password: password
			});
			account.save();
		
			Token.findOne({ user_id: account._id}, function(errToken, guid){
				Profile.findOne({ user_id: account._id}, function(errProfile, perfil){
					if(!errToken && guid){
						token = guid;
					}else{
						token = new Token({
							generated_id: mongoose.Types.ObjectId(),
							user_id: account
						});
						token.save();
					}
					if(!errProfile && profile){
						profile = perfil;
					}else{
						profile = new Profile({
							name:  {
								first: nombre, 
								last: apellido
							},
							user_id: account
						});
						profile.save()
					}


					var data = {
						status: {
							code: 1,
							message: "Perfil Creado Correctamente."
						},
						item:{
							profile_id: profile._id,
							name: {
								first: profile.name.first, 
								last: profile.name.last
							},
							email: account.email,
							token: token.generated_id
						}
					};

					res.json(data);

				});
			});
		}
	});
});
router.post('/add/data',multipartMiddleware,  function(req, res) {
	var guid  = req.body.guid;
	var data  = req.body.data;
	var value = req.body.value;


	Token.findOne({ generated_id: guid }, function(errToken, guid){
		if(!errToken && guid){
			User.findOne({ _id: guid.user_id}, function(errUser, user){
				if(!errUser && user){
					data = new ProfileData({
						user_id: user,
						tipo:    data,
						data:    value
					});
					data.save();
					res.json({
						status: {
							code: 1 ,
							message: "Este token existe y usuario existen"
						},
						item:{
							type:  data.tipo,
							value: data.data
						}
					});
				}else{
					res.json({status: {code: 2 , message: "Token existe pero usuario no."} });
				}
			});
		}else{
			res.json({status: {code: 3 , message: "Este token no existe"} });
		}

		
		
	});
});
router.post('/get', multipartMiddleware, function(req, res){
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
										first: profile.name.first, 
										last: profile.name.last
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


module.exports = router;
