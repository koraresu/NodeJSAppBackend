var express = require('express');
var router = express.Router();

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
		var Networkfunc    = require('../functions/networkfunc');
		var Tokenfunc = require('../functions/tokenfunc');
		var Skillfunc = require('../functions/skillfunc');
		var Historyfunc = require('../functions/historyfunc');
		var format = require('../functions/format');

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
			Profilefunc.compare_password(password, userData.password, function(err, statusPassword){
				res.json(userData);
				/*
				if(statusPassword){
				
					Profilefunc.userProfile(userData, function(statProfile, tokenData, userData, profileData){
						Profilefunc.logs(profileData, 24, profileData, function(){
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
						
					});
				}else{
					Generalfunc.response(111,{ },function(response){
						res.json(response);
					});
				}
				*/
			});
		}else{
			Generalfunc.response(111, {}, function(response){
				res.json(response);
			});
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
	var phone    = req.body.phone;

	Profilefunc.generate_password(password, function(pass){
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
		    phone: phone,
		    nacimiento: null,
		    public_id: mongoose.Types.ObjectId(),
		    info: [],
		    skills: [],
		    experiences: [],
		    facebookData: [],
		    job: {},
		    speciality: {},
		    profile_pic : "",
		    status: 0,
		    review_score: 0
		}, function(exist, tokenData, profileData, userData){
			if(exist){
				Generalfunc.response(112,{}, function(response){
					res.json( response );
				});
			}else{
				Profilefunc.logs(profileData, 2, {profile:profileData, token: tokenData, user: userData }, function(){
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
				});
				
			}
		});
	});
});
router.post('/sendemail', multipartMiddleware, function(req, res){
	Profile.findOne({
		_id: mongoose.Types.ObjectId("578c4e292c5f4fd7322caebd")
	}).exec(function(err, profileData){
		Generalfunc.sendEmail("email.jade", {
			public_id: profileData.public_id,
			nombre: profileData.first_name,
		}, "rkenshin21@gmail.com", "Test envio de correos",function(status, html){
			if(status){
				res.send("Enviado");
			}else{
				res.send("No Enviado");
			}			
		});
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
					profileData.facebookId = facebookID;
					profileData.facebookToken = tokenFB;

					var facebookData = [
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
							"name": "gender",
							"value": gender
						}
					];

					profileData.facebookData = [];
					profileData.facebookData = facebookData;

					Experiencefunc.get(profileData._id, function(statusExperience, experiences){
						var exp = statusExperience;	
						profileData.save(function(errProfile, profileData){
							Profilefunc.logs(profileData, 19, profileData, function(){
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
			});
		}else{
			Profilefunc.userProfileInsertIfDontExists({
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
				facebookId: facebookID,
				facebookToken: tokenFB,
				facebookData: [
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
					"name": "gender",
					"value": gender
				}
				],
			}, function(exist, tokenData, profileData){

				verified = false;

				Experiencefunc.get(profileData._id, function(statusExperience, experiences){
					var exp = statusExperience;	
					profileData.save(function(errProfile, profileData){
						Profilefunc.logs(profileData, 19, profileData, function(){
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

					Profilefunc.formatoProfile(profileData._id,function( profile ){
						Profilefunc.logs(profileData, 25, profileData, function(){
							Generalfunc.response(200, profile, function(response){
								res.json(response);
							});
						});
					});
					
					
				}else{
					Generalfunc.response(113,{},function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});

		}
	});
});
router.post('/get/friend', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var public_id = req.body.public_id;
	if(typeof public_id == "undefined"){

	}else{
		Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Profilefunc.publicId(public_id, function(anotherStatus, profileAnotherData){
						if(anotherStatus){
							Networkfunc.isFriend(profileData._id, profileAnotherData._id, function(statusFriend){
								if(statusFriend){
									Profilefunc.formatoProfile(profileAnotherData._id,function( profile ){
										Generalfunc.response(200, profile, function(response){
											res.json(response);
										});
									});
								}else{
									Generalfunc.response(114, {}, function(response){
										res.json(response);
									});
								}
							});	
						}else{

						}
					});
				}else{
					Generalfunc.response(113,{},function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
	}
	
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
							Profilefunc.logs(profileData, 27, userData, function(){
								res.json(userData);
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
			Generalfunc.response(111,{ },function(response){
				res.json(response);
			});
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
						if(userData.type == 1){
							Generalfunc.response(200, {
								message: "Es un perfil de Facebook."
							}, function(response){
								res.json(response);
							});
						}else{
							Profilefunc.compare_password(password, userData.password, function(err, data){
									Generalfunc.response(200, {
										response: data
									}, function(response){
										res.json(response);
									});
							});
						}
						
					});
					
				}else{
					Generalfunc.response(111,{ },function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(111,{ },function(response){
				res.json(response);
			});
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
	var job        = req.body.job;
	var speciality = req.body.speciality;	
	var birthday   = req.body.birthday;

	var type       = req.body.type;
	var company    = req.body.company;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				profileData.first_name = nombre;
				profileData.last_name  = apellido;
				Experiencefunc.jobExistsOrCreate({ name: job, type: 1}, { name: job, type: 1}, function(statusJob, jobData){
					if(type == 1){
						data = {
							ocupation: ocupation,
							company: company,
							sector: sector
						};
					}else{
						data = {
							ocupation: job,
						};
					}
					
					Experiencefunc.insertOrExists(profileData,type, data, function(statusExperience, experienceData){
						Experiencefunc.profileGenerate(profileData, function(profileData){
							var job = {
								id: jobData._id,
								name: jobData.name
							};
							profileData.job = job;
							profileData.status = statusReq;

						


					

					




							profileData.save(function(err, profileData){
								res.json(profileData);
							});
						});
					});
				});
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			})
		}
	});
});
// INSERT EXPERIENCE
// Parameter:
//  	Token
//  	Type
//  	Company
//  	Job
//  	Speciality
//  	Sector
//  	Ocupation
//
// Return (Formato 5)
//		Profile
//		Experiences
router.post('/experience', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	var type       = req.body.type;
	var company    = req.body.company;
	var job        = req.body.job;
	var speciality = req.body.speciality;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;


		Tokenfunc.exist(guid, function(status, tokenData){
			if(status){
				Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
					var data = {
						ocupation: ocupation,
						company: company,
						sector: sector
					};

					Experiencefunc.insert(profileData, data, function(statusExperience, experienceData){
						console.log(experienceData);
						Profile.findOne({ _id: profileData._id}, function(errProfile, profileData){
							Experience.find({ profile_id: profileData._id}, function(errExperience, experienceData){
								Generalfunc.response(200, { profile: format.littleProfile(profileData), experiences: experienceData}, function(response){
									res.json(response);
								});
							});
						});
					});
				});
			}else{
				Generalfunc.response(101, {}, function(response){
					res.json(response);
				});
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
	var guid       = req.body.guid;

	var type       = req.body.type;
	var company    = req.body.company;
	
	var job        = req.body.job;
	var speciality = req.body.speciality;

	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				var data = [];
				if(type == 1){
					data = {
						ocupation: ocupation,
						company: company,
						sector: sector
					};
				}else{
					data = {
						ocupation: job,
					};
				}
				
				Experiencefunc.insertOrExists(profileData,type, data, function(statusExperience, experienceData){
					Experiencefunc.specialityExistsOrCreate({
						name: speciality
					},{
						name: speciality
					}, function(status, specialityData){

						Experiencefunc.jobExistsOrCreate({
							name: job
						}, {
							name: job
						}, function(status, jobData){
							console.log("JobExsits");
							Profile.findOne({ _id: profileData._id }).exec(function(errProfile, profileData){
								profileData.job = {
									id: jobData._id,
									name: jobData.name
								};
								profileData.speciality = {
									id: specialityData._id,
									name: specialityData.name
								};
								profileData.save(function(errProfile, profileData){
									console.log(errProfile);
									console.log("Save Profile");
									console.log(profileData);
									Profilefunc.logs(profileData, 3, experienceData, function(){
										Experiencefunc.profileGenerate(profileData, function(profileData){

											Generalfunc.response(200, profileData, function(response){
												res.json(response);
											});	
										});
									});
								});
							});
						});
					});
				});
				
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			})
		}
	});
});
/*
router.post('/update-experience', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;

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

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				Profilefunc.update(profileData._id, {
					first_name: nombre, 
					last_name: apellido,
					birthday: birthday,
					status: statusReq,
					speciality: speciality,
					job: job,
					phone: phone
				}, function(statusProfile, profileData){
					Experiencefunc.insertOrExists(profileData,ocupation, company, sector, function(statusExperience, experienceData){
						profileData.experiences = [];
						Experience.find({ profile_id: profileData._id}).exec(function(errExperience, experiencesData){
							profileData.experiences = experiencesData.map(function(o){
								return o._id;
							});
							profileData.save(function(errProfile, profileData){
								Profile.findOne({ _id: profileData._id }).populate('experiences').populate('skills').populate('user_id').exec(function(errProfile, profileData){
									
									format.profileformat(profileData, function(profileData){
										Generalfunc.response( 200, profileData, function(response){
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
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			})
		}
	});
});
*/
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
					
					Profilefunc.findSkill(profileData._id,skillData,function(status, skill){
						console.log(status);
						if(status){
							format.profileformat(profileData, function(profileData){
								Generalfunc.response(200, profileData, function(response){
									res.json(response);
								});
							});
							
						}else{
							var filter = profileData.skills.filter(function(o){
								return o == skillData._id
							});

							console.log(filter.length);

							if(filter.length > 0){
								format.profileformat(profileData, function(profileData){
									Generalfunc.response(200, profileData, function(response){
										res.json(response);
									});
								});
							}else{
								console.log(skillData);
								profileData.skills.push(skillData._id);
								profileData.save(function(errProfile, profileData){
									Profilefunc.logs(profileData, 15, skill, function(){
										format.profileformat(profileData, function(profileData){
											Generalfunc.response(200, profileData, function(response){
												res.json(response);
											});
										});
									});
								});
							}
						}
					});
					

				});
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			})
		}
		
	});
});
router.post('/editskill', multipartMiddleware, function(req, res){ // Eliminar skill en el perfil y crear uno nuevo.
	var guid             = req.body.guid;
	var from             = req.body.from;
	var to               = req.body.to;

	Tokenfunc.exist(guid, function(status, tokenData){

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
					format.profileformat(profileData, function(profileData){
						Generalfunc.response(200, profileData, function(response){
							res.json(response);
						});
					});
				});
			});
		}else{
			Generalfunc.response(101, {}, function(response){
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

					Profilefunc.logs(profileData, 13, profileData, function(){
						Generalfunc.response(200,{	
							verified: verified
						}, function(response){
							res.json(response);
						});
					});
				}else{
					Generalfunc.response(404,{}, function(response){
						res.json(response);
					});
				}
				
			});
		}else{
			Generalfunc.response(101, {}, function(response){
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
					Profilefunc.logs(profileData, 4, profileData, function(){
						console.log(profileData);
						var profile = format.littleProfile(profileData);

						console.log(profile);
						var data = {};
						data = profile;
						console.log(data);
						Generalfunc.response(200,data, function(response){
							res.json(response);
						});
					});
				});
			});
		}else{
			Generalfunc.response(101,{},function(response){
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

					Profile.findOne({ _id: profileData._id}).populate('experiences').populate('skills').populate('user_id','-password').exec(function(errProfile, profileData){

						Experiencefunc.get(profileData._id, function(statusExperience, experiences){
							var exp = statusExperience;	
							var verified = false;

							if(userData.verified){
								verified = true;
							}
							Profilefunc.logs(profileData, 14, profileData, function(){
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

					});

				}else{
					Generalfunc.response(101, {}, function(response){
						res.json(response);
					});
				}

			});
		}else{
			Generalfunc.response(101, {}, function(response){
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
// PETICION EMPRESA
// Parameter:
//  	Token
//
// Return (Formato 14)
router.post('/company/petition', multipartMiddleware, function(req, res){
	var guid = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					Profilefunc.logs(profileData, 20, profileData, function(){

					});
				}else{

				}
			});
		}else{

		}
	});
});
router.post('/location', multipartMiddleware, function(req, res){
	var guid = req.body.guid;
	var search = req.body.search;
	var reg  = new RegExp(search, "i");
	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					City.find().populate('state_id').find({
							name: reg
					}).exec(function(err, cityData){
						var data = [];
						cityData.forEach(function(item, index){
							var d = {
								_id: item._id,
								name: item.name+", "+item.state_id.name
							};
							data.push(d);
							if(index+1 == cityData.length){
								res.json(data);
							}
						});
					})
				}
			});
		}
	});


});

module.exports = router;
