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

var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');


var Profile     = require('../models/profile');
var User        = require('../models/user');
var Token       = require('../models/token');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
var Network     = require('../models/network');

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

	func.userProfileLogin(email, password, function(status, tokenData, userData, profileData){
		console.log(status)
		if(status){
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
		}else{
			func.response(111, {}, function(response){
				res.json(response);
			})
		}
	});
});
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

	func.userProfileInsertIfDontExists({
		email: email
	},{
		email: email,
		password: password,
		verified: false,
		status: 1
	},{
		first_name: nombre,
		last_name: apellido,
		nacimiento: null,
		ocupation: {},
		speciality: {},
		public_id: mongoose.Types.ObjectId(),
		experiences: []
	}, function(exist, tokenData){
		if(exist){
			func.response(112,{}, function(response){
				res.json( response );
			});
		}else{
			func.response(200,{
				token: tokenData.generated_id
			},function(response){
				res.json( response );
			} );
		}
	});
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
						Profilefunc.findOne({ _id: profileData }, function(errProfile, profileData){
							func.response(200, { profile: profileData, experience: experienceData }, function(response){
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
									func.response(200, profileData, function(response){
										res.json(response);
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
				console.log("TokenToProfile");
				Skillfunc.add(profileData, name, function(status, skillData, profileData){
					if(status){
						console.log("SkillAdd");
						func.response(200, profileData, function(response){
							console.log("OK");
							res.json(response);	
						});	
					}else{
						func.response(404, {}, function(response){
							res.json(response);
						});
					}
					
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
					func.response(200, profileData, function(response){
						res.json(response);
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
					res.json(profileData);
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
					res.json(profileInfoData);
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