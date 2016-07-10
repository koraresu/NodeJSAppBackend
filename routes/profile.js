var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var faker = require('faker');
faker.locale = "es_MX";
var mongoose    = require('mongoose');
/*
	Nombre de Modelos:
		Toda las variables de modelo se nombrara, con el nombre del archivo, eliminando _ 
		y cambiando la siguiente letras al _ por mayuscula. Iniciando la primera letra en mayuscula.
		*/
		var Generalfunc = require('../functions/generalfunc');
		var Profilefunc = require('../functions/profilefunc');
		var Experiencefunc = require('../functions/experiencefunc');
		var Tokenfunc = require('../functions/tokenfunc');
		var Skillfunc = require('../functions/skillfunc');
		var Historyfunc = require('../functions/historyfunc');
		var format = require('../functions/format');

		var Profile     = require('../models/profile');
		var User        = require('../models/user');
		var Token       = require('../models/token');
		var Job         = require('../models/job');
		var Company     = require('../models/company');
		var Experience  = require('../models/experience');
		var Network     = require('../models/network');
/*
Nombre de Objectos de Documentos:
	Todo dato recibido por FUNC, que sea un documento de mongo, se le colocara como nombre de varible el nombre del modelo,
	seguido de la palabra "Data"*Respetando Mayusculas*, se cambio el modelo ProfileData a ProfileInfo para no tener problemas.

	*/



// LOGIN
// Parameter
// 		email     = Email
// 		password  = Contraseña
// Return (Formato 1)
// 		Generated Token
// 		Verified Status
// 		Experiences Status
router.post('/login', multipartMiddleware, function(req, res){
	var email    = req.body.email;
	var password = req.body.password;

	User.findOne({ email: email, type: 0}, function(errUser, userData){
		if(!errUser && userData){
			Profilefunc.compare_password(password, userData.password, function(statusPassword){
				if(statusPassword){
					Profile.findOne({ user_id: userData._id }).exec(function(errProfile, profileData){
						if(!errProfile && profileData){
							console.log("Profile Exists");
						}else{
							console.log("Profile Fails");
						}
					});
				}else{

				}
			});
		}else{

		}
	});
});
/*
router.post('/login', multipartMiddleware, function(req, res){
	var email    = req.body.email;
	var password = req.body.password;
	User.findOne({email: email, type: 0 }, function(errUser, userData){
		if(!errUser && userData){
			if(typeof userData != "undefined"){
				Profilefunc.compare_password(password, userData.password, function(status){
					if(status){
						Profilefunc.userProfile(userData, function(statProfile, tokenData, userData, profileData){
							Experiencefunc.get(profileData._id, function(statusExperience, experiences){
								var exp = statusExperience;	
								var verified = false;

								if(userData.verified){
									verified = true;
								}
								Generalfunc.response(201,{
									token: tokenData.generated_id,
									verified: verified,
									experiences: exp,
									profile: profileData
								}, function(response){
									res.json(response);
								});
							});
						});
					}else{
						Generalfunc.response(111,{ },function(response){
							res.json(response);
						});
					}
				});
			}else{
				Generalfunc.response(111, {}, function(response){
					res.json(response);
				});
			}
		}else{
			Generalfunc.response(111, {}, function(response){
				res.json(response);
			});
		}
	});	
});
*/
// CREATE
// Parameter:
// 		first_name     = Nombre
// 		last_name      = Apellido
//		email          = Email
// 		password       = Contraseña
// Return (Formato 2)
// 		Generated Token

router.post('/create', multipartMiddleware, function(req, res){
	var nombre   = req.body.first_name;
	var apellido = req.body.last_name;
	var email    = req.body.email;
	var password = req.body.password;

	var pass = Profilefunc.generate_password(password);


	Profilefunc.userProfileInsertIfDontExists({
		email: email
	},{
		email: email,
		password: pass,
		verified: false,
		type: 0
	},{
		first_name: nombre,
		last_name: apellido,
		nacimiento: null,
		ocupation: {},
		speciality: {},
		public_id: mongoose.Types.ObjectId(),
		experiences: []
	}, function(exist, tokenData, profileData, userData){
		if(exist){
			Generalfunc.response(112,{}, function(response){
				res.json( response );
			});
		}else{
			Generalfunc.sendEmail("email.jade", {
				public_id: profileData.public_id,
				nombre: profileData.first_name,
			}, userData.email, "Verificación de Correo",function(status, html){
				if(status){
					Generalfunc.response(200,{
						token: tokenData.generated_id,
						profile: profileData
					},function(response){
						res.json( response );
					});
				}else{
					Generalfunc.response(101,{},function(response){
						res.json( response );
					});
				}			
			});
		}
	});
});
// CREATE FACEBOOK
// Parameter:
// 		first_name     = Nombre
// 		last_name      = Apellido
//		email          = Email
// Return (Formato 2)
// 		Generated Token

router.post('/login-facebook', multipartMiddleware, function(req, res){
	var email      = req.body.email;
	var first_name     = req.body.first_name;
	var last_name   = req.body.last_name;
	var gender     = req.body.gender;
	var profilepic = req.body.profilepic;
	var facebookID = req.body.facebook_id;
	var tokenFB    = req.body.token;
	var name       = req.body.name;

	User.findOne({ email: email}, function(errUser, userData){
		if(!errUser && userData){

			var verified = false;

			if(userData.verified){
				verified = true;
			}

			Token.findOne({ user_id: userData._id}, function(errToken, tokenData){
				Profile.findOne({ user_id: userData._id}, function(errProfile, profileData){
					var info = [
					{
						"name": "first_name",
						"value": first_name
					},
					{
						"name": "last_name",
						"value": last_name
					},
					{
						"name": "name",
						"value":name
					},
					{
						"name": "picture",
						"value": profilepic
					},
					{
						"name": "email",
						"value": email
					},
					{
						"name": "access-token",
						"value": tokenFB
					},
					{
						"name": "gender",
						"value": gender
					},
					{
						"name": "id",
						"value": facebookID
					}
					];

					profileData.info = [];
					profileData.info = info;

					Experiencefunc.get(profileData._id, function(statusExperience, experiences){
						var exp = statusExperience;	
						profileData.save(function(errProfile, profileData){
							Generalfunc.response(201,{
								token: tokenData.generated_id,
								verified: verified,
								experiences: exp,
							}, function(response){
								res.json(response);
							});
						});
					});
					
				});
			});
		}else{
			func.userProfileInsertIfDontExists({
				email: email
			},{
				email: email,
				verified: false,
				type: 1
			},{
				first_name: first_name,
				last_name: last_name,
				nacimiento: null,
				ocupation: {},
				speciality: {},
				public_id: mongoose.Types.ObjectId(),
				experiences: [],
				info: [
				{
					"name": "first_name",
					"value": first_name
				},
				{
					"name": "last_name",
					"value": last_name
				},
				{
					"name": "name",
					"value":name
				},
				{
					"name": "picture",
					"value": profilepic
				},
				{
					"name": "email",
					"value": email
				},
				{
					"name": "access-token",
					"value": tokenFB
				},
				{
					"name": "gender",
					"value": gender
				},
				{
					"name": "id",
					"value": facebookID
				}
				],
			}, function(exist, tokenData, profileData){

				verified = false;

				Experiencefunc.get(profileData._id, function(statusExperience, experiences){
					var exp = statusExperience;	
					profileData.save(function(errProfile, profileData){
						Generalfunc.response(201,{
							token: tokenData.generated_id,
							verified: verified,
							experiences: exp,
						}, function(response){
							res.json(response);
						});
					});
				});
			});
		}
	});
	/*
	

	*/
});

// GET
// Parameter:
//  	Token
// Return (Formato 3)
// 		User
//		Profile
//		Profile Info
//		Experiences

router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					/*
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
					*/

					Profilefunc.formatoProfile(profileData._id,function( profile ){

						Generalfunc.response(200, profile, function(response){
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
router.post('/changepassword', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var password  = req.body.password;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					User.findOne({ _id: profileData.user_id }, function(errUser, userData){
						userData.password = Profilefunc.generate_password(password);
						userData.save(function(errUser, userData){
							res.json(userData);
						});
					});
					
				}else{
					res.json("H");
				}
			});
		}else{
			res.json("T");
		}
	});
});
router.post('/checkpassword', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var password  = req.body.password;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					User.findOne({ _id: profileData.user_id }, function(errUser, userData){
						
						if(Profilefunc.compare_password(userData.password, password)){
							res.send("True");
						}else{
							res.send("False");
						}

					});
					
				}else{
					res.json("H");
				}
			});
		}else{
			res.json("T");
		}
	});
});
// UPDATE
// Parameter:
//  	Token
//  	Nombre
//  	Apellido
//  	Status
//  	Type
//  	Company
//  	Job
//  	Speciality
//  	Sector
//  	Ocupation
//  	Birthday
//
// Return (Formato 4)
//		Profile
//		Experiences

router.post('/update', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	var nombre    = req.body.first_name;
	var apellido  = req.body.last_name;
	var statusReq = req.body.status;

	var type       = req.body.type;
	var company    = req.body.company;
	var job        = req.body.job;
	var speciality = req.body.speciality;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;

	var birthday   = req.body.birthday;


	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				Profilefunc.update(profileData._id, nombre, apellido, birthday, statusReq, function(statusProfile, profileData){
					var data = [];
					for(var x = 0; x<company.length;x++){
						data.push({
							ocupation: ocupation[x],
							company: company[x],
							sector: sector[x]
						});

					}
					
					Experiencefunc.updates(profileData,data, function(statusExperience, experienceData){
						Profilefunc.formatoProfile(profileData._id,function(err, profile){
							var data = [];
							data = _.extend(data,profile);

							func.response(200,data, function(response){
								res.json(response);
							});
						});
					});
				});	
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			})
		}
	});
});
// UPDATE EXPERIENCE
// Parameter:
//  	Token
//  	Nombre
//  	Apellido
//  	Status
//  	Type
//  	Company
//  	Job
//  	Speciality
//  	Sector
//  	Ocupation
//  	Birthday
//
// Return (Formato 5)
//		Profile
//		Experiences
router.post('/update-experience', multipartMiddleware, function(req, res){

	console.log(req.body);
	var guid      = req.body.guid;

	var nombre    = req.body.first_name;
	var apellido  = req.body.last_name;
	var statusReq = req.body.status;

	var type       = req.body.type;
	var company    = req.body.company;
	var job        = req.body.job;
	var speciality = req.body.speciality;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;

	var birthday   = req.body.birthday;


	if(typeof company == "undefined"){
		company = [];
	}
	if(typeof ocupation == "undefined"){
		ocupation = [];
	}
	if(typeof sector == "undefined"){
		sector = [];
	}

	if(typeof req.body.company_uno != "undefined"){
		company[0] = req.body.company_uno;
	}
	if(typeof req.body.company_dos != "undefined"){
		company[1] = req.body.company_dos;
	}

	if(typeof req.body.ocupation_uno != "undefined"){
		ocupation[0] = req.body.ocupation_uno;
	}
	if(typeof req.body.ocupation_dos != "undefined"){
		ocupation[1] = req.body.ocupation_dos;
	}
	if(typeof req.body.sector_uno != "undefined"){
		sector[0] = req.body.sector_uno;
	}
	if(typeof req.body.sector_dos != "undefined"){
		sector[1] = req.body.sector_dos;
	}

	console.log(company);
	console.log(ocupation);


	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				Profilefunc.update(profileData._id, nombre, apellido, birthday, statusReq, speciality, job,  function(statusProfile, profileData){
					var data = [];

					for(var x = 0; x<company.length;x++){
						data.push({
							ocupation: ocupation[x],
							company: company[x],
							sector: sector[x]
						});
					}

					Experiencefunc.updates(profileData, data, function(statusExperience, experienceData){
						Profile.findOne({ _id: profileData._id}, function(errProfile, profileData){
							Experience.find({ profile_id: profileData._id}, function(errExperience, experienceData){
								var d = [];
								experienceData.forEach(function(item, index){
									d.push({
										ocupation_name: item.ocupation.name,
										company_name:   item.company.name,
										sector_name:    item.sector.name
									});
								});
								profileData.experiences = [];
								profileData.experiences = d;

								profileData.save(function(errProfile, profileData){
									Profilefunc.formatoProfile(profileData._id,function(err, profile){
										var data = [];
										data = _.extend(data,profile);

										func.response(200,data, function(response){
											res.json(response);
										});
									});
								});
							});
						});
					});

					
				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			})
		}
	});
});
// ADD SKILL
// Parameter:
//  	Token
//  	Nombre de Skill
//
// Return (Formato 6)
//		Profile
router.post('/addskill', multipartMiddleware, function(req, res){
	var guid             = req.body.guid;
	var name             = req.body.name;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){

				Skillfunc.ExistsOrCreate({
					name: name
				}, {
					name: name
				}, function(status, skillData){
					
					Profilefunc.findSkill(profileData._id,name,function(status, skill){
						data = {};
						if(status){
							console.log("Dont Created");
							var data = {
								status: "dont-created",
								skill: skill
							};
							console.log(data);
							Generalfunc.response(200, data, function(response){
								res.json(response);
							});
						}else{
							console.log("Created");

							profileData.skills.push({
								_id: skillData._id,
								name: skillData.name
							});
							profileData.save(function(errProfile, profileData){
								var data = {
									status: "created",
									skill: skillData
								};
								console.log(data);
								Generalfunc.response(200, data, function(response){
									Historyfunc.generate_history("6", profileData, skillData, function(){
										res.json(response);	
									});
								});
							});
						}
					});
					

				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			})
		}
		
	});
});
// DELETE SKILL
// Parameter:
//  	Token
//  	Nombre de Skill
//
// Return (Formato 7)
//		Profile
router.post('/deleteskill', multipartMiddleware, function(req, res){
	var guid             = req.body.guid;
	var name             = req.body.name;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				Skillfunc.delete(profileData._id, name, function(err, profileData){
					Profilefunc.formatoProfile(profileData._id,function(err, profile){
						var data = [];
						data = _.extend(data,profile);

						func.response(200,data, function(response){
							res.json(response);
						});
					});
				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			})
		}
		
	});	
});
// VERIFY
// Parameter:
//  	Token
//
// Return (Formato 8)
//		Verificado
router.post('/verify', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(statusProfile, userData, profileData, profileInfoData){
				if(statusProfile){
					var verified = false;

					if(userData.verified){
						verified = true;
					}
					func.response(200,{	
						verified: verified
					}, function(response){
						res.json(response);
					});
				}else{
					func.response(404,{}, function(response){
						res.json(response);
					});
				}
				
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
// SET PROFILE
// Parameter:
//  	Token
// 		File - Profilepic
//
// Return (Formato 9)
//		Profile
router.post('/setprofilepic', multipartMiddleware, function(req, res){
	var guid             = req.body.guid;
	var profilepic      = req.files.profilepic;
	var tmp_path         = profilepic.path;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){

				Profilefunc.updateProfilePic(profileData._id, profilepic, function(err, profileData){
					console.log(profileData);
					var profile = format.littleProfile(profileData);

					console.log(profile);
					var data = {};
					data = profile;
					console.log(data);
					func.response(200,data, function(response){
						res.json(response);
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
// FACEBOOK LOGIN
// Parameter:
//  	Token
// 		File - Profilepic
//
// Return (Formato 10)
//		P

// FACEBOOK CREATE
// Parameter:
//  	Token
// 		File - Profilepic
//
// Return (Formato 11)
//		P

// FACEBOOK EXISTS
// Parameter:
//  	Token
// 		File - Profilepic
//
// Return (Formato 12)
//		P
router.post('/facebook', multipartMiddleware, function(req, res){
	var guid = req.body.guid;

	var first_name = req.body.first_name;
	var last_name  = req.body.last_name;
	var name       = req.body.name;
	var picture    = req.body.picture;
	var email      = req.body.email;
	var token      = req.body.token;
	var gender     = req.body.gender;
	var id         = req.body.id;
	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				Profilefunc.addinfo(profileData._id, [
				{
					"name": "first_name",
					"value": first_name
				},
				{
					"name": "last_name",
					"value": last_name
				},
				{
					"name": "name",
					"value":name
				},
				{
					"name": "picture",
					"value": picture
				},
				{
					"name": "email",
					"value": email
				},
				{
					"name": "access-token",
					"value": token
				},
				{
					"name": "gender",
					"value": gender
				},
				{
					"name": "id",
					"value": id
				}
				], function(profileInfoData){
					Profilefunc.formatoProfile(profileData._id,function(err, profile){
						var data = [];
						data = _.extend(data,profile);

						func.response(200,data, function(response){
							res.json(response);
						});
					});
				});
			});
		}else{
			func.response(113,{},function(response){
				res.json(response);
			});
		}
	});
});
// TOKEN EXISTS
// Parameter:
//  	Token
//
// Return (Formato 13)
// 		User
//		Profile
//		Experiences
//		Verificado
router.post('/token/exists', multipartMiddleware, function(req, res){
	var guid = req.body.guid;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					var verified = false;
					if(userData.verified){
						verified = true;
					}

					func.experienceGet(profileData._id, function(statusExperience, experiences){
						var exp = false;
						console.log(experiences);
						if(experiences.length > 0){
							exp = true;
						}

						func.response(200, {
							user: userData,
							profile:profileData,
							experiences: exp,
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
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
// RESEND EMAIL VERIFICATION
// Parameter:
//  	Token
//
// Return (Formato 13)
router.post('/send/verification', multipartMiddleware, function(req, res){
	var guid = req.body.guid;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					Generalfunc.sendEmail("email.jade", {
						public_id: profileData.public_id,
						nombre: profileData.first_name,
					}, userData.email, "Verificación de Correo",function(status, html){
						if(status){
							Generalfunc.response(200, { status: true }, function(response){
								res.json(response);
							});
						}else{
							Generalfunc.response(101, { status: false }, function(response){
								res.json(response);
							});
						}
						
					});
				}else{
					res.send("No Profile");
				}
			});
		}else{
			res.send("No Token");
		}
	});
});

module.exports = router;
