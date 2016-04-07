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

	User.findOne({ email: email, password: password }, function(errUser, user){
		if (!errUser && user){
			Token.findOne({ user_id: user._id}, function(errToken, guid){
				if(!errToken && guid){
						var verified = false;
						if(user.verified){
							verified = true
						}


						res.json({
							status: 1,
							email: user.email,
							token: guid.generated_id,
							verified: false,
							job_set: false,
							speciality: false,
							company: false,

						});
					
				}else{
					res.json({status: {code: 2 , message: "Este token ya esta siendo usado."} });
				}
			});
		}else{
			res.json({status: {code: 3 , message: "Este email ya esta siendo usado."} });
		}
	});
});
router.post('/create',multipartMiddleware,  function(req, res) {

	var nombre   = req.body.nombre;
	var apellido = req.body.apellido;
	var email    = req.body.email;
	var password = req.body.password;
	


	var account;
	var token;
	var profile;
	User.findOne({ email: email}, function(errUser, user){
		console.log("Cuenta Buscada");
		if (!errUser && user){
			res.json({status: 2 });
		}else{
			account = new User({
				email: email,
				password: password,
				verified: false
			});
			account.save();
			
			console.log("Cuenta Creada");
			Token.findOne({ user_id: account._id}, function(errToken, guid){
				console.log("Token Buscada");
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
							user_id: account,
							verified: false
						});
						profile.save()
					}
					var data = {
						status: 1,
						profile_id: profile._id,
						firstname: profile.name.first, 
						lastname: profile.name.last,
						email: account.email,
						token: token.generated_id
					};

					res.json(data);

				});
			});
		}
	});
});

router.post('/create/company', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var companyst = req.body.company;
	var jobst     = req.body.job;

	Token.findOne({ generated_id: guid }, function(errToken, guid){
		var token = guid;
		if(!errToken && guid){
			User.findOne({ _id: guid.user_id}, function(errUser, user){
				var account = user;
				if(!errUser && user){
					Profile.findOne({ user_id: account._id}, function(errProfile, perfil){
						var profile = perfil;
						if(!errProfile && perfil){

							Company.findOne({ name: companyst}, function(errCompany, company){
								Job.findOne({ name: jobst}, function(errJob, job){
									var a = {job: job, company: company};
									res.json(a);
								});
							});


							
							
							
							
						}
					});
				}
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
						status: 1 ,
						type:  data.tipo,
						value: data.data
					});
				}else{
					res.json({status: 2});
				}
			});
		}else{
			res.json({status: 3 });
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
