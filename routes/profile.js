var express = require('express');
var router = express.Router();


var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var mime = require('mime');

var async = require('async');

var appDir = path.dirname(path.dirname(require.main.filename));

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
		var Forgot      = model.forgot;
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
		var Device       = model.device;
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
				
				
				if(statusPassword){

					Profilefunc.userProfile(userData, function(statProfile, tokenData, userData, profileData){
						Profilefunc.logs(profileData, 24, profileData, function(){
							Experiencefunc.get(profileData._id, function(statusExperience, experiences){
								var exp = statusExperience;
								var spe = false;
								var all = false;
								if(profileData.speciality != undefined){
									if(profileData.speciality.name != undefined){
										spe = true;
									}
								}
								var verified = false;

								var photo = false;
								if(profileData.profile_pic != undefined || profileData.profile_pic != null){
									photo = true;
								}

								if(userData.verified){
									verified = true;
								}

								if(spe || exp){
									all = true;
								}
								Network.findOne({ profiles: { $in: [profileData._id] } }).exec(function(errNetwork, networkData){
									Generalfunc.response(201,{
										token: tokenData.generated_id,
										verified: verified,
										experiences: all,
										photo: photo,
										profile: profileData,
										network: networkData
									}, function(response){
										res.json(response);
									});
								});
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
	});
	
});
// LOGOUT
// Parameter
// 		guid
// Return (Formato 1)
//      devices Deleted
router.post('/logout', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Device.remove({ profile: profileData._id }).exec(function(err, deviceData){
						if(!err && deviceData){
							Generalfunc.response(200, { status: true,devices: deviceData }, function(response){
								res.json( response );
							});
						}else{
							Generalfunc.response(101, { status: false }, function(response){
								res.json( response );
							});
						}
						
					});
				}else{
					Generalfunc.response(101, { status: false }, function(response){
						res.json( response );
					});
				}
			});
		}else{
			Generalfunc.response(101, { status: false }, function(response){
				res.json( response );
			});
		}
	});
});
// FORGOT
// Parameter
// 		email     = Email
// Return (Formato 1)
//      status
router.post('/forgot', multipartMiddleware, function(req, res){
	var email    = req.body.email;

	email = email.trim();
	
	User.findOne({
		email: email
	}).exec(function(err, userData){
		if(!err && userData){
			var forgot = new Forgot({
				user: userData._id,
				generated_id: mongoose.Types.ObjectId(),
				used: false
			});

			forgot.save(function(err, forgotData){
				Profile.findOne({ user_id: userData._id }).exec(function(err, profileData){
					Generalfunc.sendEmail("emailforgot.jade", {
						nombre: profileData.first_name+" "+profileData.last_name,
						generated_id: forgotData.generated_id,
					}, userData.email, "Restablece tu contraseña",function(status, html){
						
						if(status){
							res.json( forgotData );
						}else{

						}
					});
				});
				
			});
		}else{
			var d = { message: 'no existe email'};
			res.json(d);
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
	var facebook = req.body.facebook;
	var typeUser = 0;
	var facebookData = [];

	if( Profilefunc.IsJsonString(facebook)){
		typeUser = 1;
		
		facebook = JSON.parse(facebook);

		facebookId = facebook.fId;
		facebookTo = facebook.token;

		var result = facebook.result;

        var facebookData = [
        {
        	"name": "first_name",
        	"value": result.first_name
        },
        {
        	"name": "last_name",
        	"value": result.last_name
        },
        {
        	"name": "name",
        	"value": result.name
        },
        {
        	"name": "picture",
        	"value": ""
        },
        {
        	"name": "email",
        	"value": result.email
        },
        {
        	"name": "gender",
        	"value": result.gender
        }
        ];

        
        
        
	}
	

	var pass = Profilefunc.generate_password(password);
	
	
	
	Profilefunc.userProfileInsertIfDontExists({
		email: email
	},{
		email: email,
		password: pass,
		verified: false,
		type: typeUser
	},{
		first_name: nombre,
		last_name: apellido,
		profile_pic: null,
		profile_hive: null,
		qrcode: null,
		status: 0,
		birthday: null, 
		facebookId: "",
		facebookToken: "",
		facebookData: [],
		lang: "es",
		phone: phone,
		experiences: [],
		skills: [],
		info: [],
		public_id: mongoose.Types.ObjectId(),
		speciality: {},
		job: {},
		review_score: 0,
		block: false,
		location:{
			city: null,
			state: null
		}
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

			var verified = true;

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
							Profile.findOne({ _id: profileData._id })
							.populate('skills')
							.populate('experiences')
							.exec(function(err, profileData){
								Generalfunc.response(201,{
									action: 1,
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
					
				});
			});
		}else{
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

			Generalfunc.response(200,{
				fb_id: facebookID,
				fb_token: tokenFB,
				fb_info: facebookData,
				action: 0
			}, function(response){
				res.json(response);
			});

		}
	});
});
// CHECK FACEBOOK
// Parameter:
// 		facebook_id
// Return (Formato 2)
// 		
router.post('/check-facebook', multipartMiddleware, function(req, res){
	var facebookId = req.body.facebook_id;
	var email      = req.body.email;

	Profile.findOne({ facebookId: facebookId }).exec(function(err, profileData){
		if(!err && profileData){
			User.findOne({ email: email}, function(errUser, userData){
				if(!errUser && userData){
					Generalfunc.response(200, { status: true}, function(response){
						res.json(response);
					});
				}else{
					Generalfunc.response(200, { status: false}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(404, {}, function(response){
				res.json(response);
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
router.post('/get-deep', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){

					Profilefunc.formatoProfileDeep(profileData._id,function( profile ){
						Profilefunc.logs(profileData, 25, profileData, function(){
							City.findOne({ _id: profileData.location.city }).exec(function(errCity, cityData){
								profileData.location =  cityData;
								Generalfunc.response(200, profile, function(response){
									res.json(response);
								});
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
router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){

					Profilefunc.formatoProfile(profileData._id,function( profile ){
						Profilefunc.logs(profileData, 25, profileData, function(){
							City.findOne({ _id: profileData.location.city }).exec(function(errCity, cityData){
								profileData.location =  cityData;
								Generalfunc.response(200, profile, function(response){
									res.json(response);
								});
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
router.post('/setfacebook',multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	var email      = req.body.email;
	var first_name     = req.body.first_name;
	var last_name   = req.body.last_name;
	var gender     = req.body.gender;
	var profilepic = req.body.profilepic;
	var facebookID = req.body.facebook_id;
	var tokenFB    = req.body.token;
	var name       = req.body.name;


	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
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

					profileData.save(function(errProfile, profileData){
						Generalfunc.response(200, profileData, function(response){
							res.json(response);
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
router.post('/get/friends', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var public_id = req.body.public_id;
	var accepted  = req.body.accepted;

	if( req.body.accepted == undefined){
		accepted = true;
	}else{
		if(accepted == "true"){
			accepted = true;
		}else{
			accepted = false;
		}
	}

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){

					if(mongoose.Types.ObjectId.isValid( public_id )){

						public_id = mongoose.Types.ObjectId( public_id );

						Profile.findOne({ public_id: public_id }).exec(function(errProfileAnother, profileAnotherData){

							if(!errProfileAnother && profileAnotherData){
								var d = {
									profiles: {
										$in: [profileAnotherData._id],
									},
									accepted: accepted
								};

								Network.find(d).populate('profiles').exec(function(errNetwork, networkData){
									async.map( networkData , function(item, ca){

										var profiles = item.profiles;

										var first  = profiles[0];
										var second = profiles[1];
										
										var p = { };
										var d = "";
										if(first._id.toString() == profileAnotherData._id.toString()){
											p = second;
											d = "s";
										}else{
											p = first;
											d = "f";
										}

										

										ca( null, {
											profile: p,
											accepted: item.accepted,
											geting: d
										} );
									}, function(err, results){
										Generalfunc.response(200, { profile: profileAnotherData, friends: results }, function(response){
											res.json(response);
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
						var d = {
							profiles: {
								$in: [profileData._id],
							},
							accepted: accepted
						};

						Network.find(d).populate('profiles').exec(function(errNetwork, networkData){
							async.map( networkData , function(item, ca){
								
								var profiles = item.profiles;
								if(item.profiles.length > 1){
									var equal = Generalfunc.profile_ajeno(profileData._id, profiles);
									var p = Profilefunc.formato(equal);
									
									ca( null, {
										profile: p,
										accepted: item.accepted
									});	
								}else{
									ca(null, null);
								}
							}, function(err, results){
								results = Generalfunc.cleanArray(results);
								Generalfunc.response(200, { profile: profileData,friends: results }, function(response){
									res.json(response);
								});
							});
						});
					}
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
router.post('/get/friend', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var public_id = req.body.public_id;
	if(typeof public_id == "undefined"){
		Generalfunc.response(101, {}, function(response){
			res.json(response);
		});
	}else{
		Tokenfunc.exist(guid, function(status, tokenData){
			if(status){
				Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
					if(status){
						Profilefunc.publicId(public_id, function(anotherStatus, profileAnotherData){
							if(anotherStatus){
								Networkfunc.typeFriend(profileData._id, profileAnotherData._id, function(statusFriend){
									var code_http = 200;
									if( statusFriend == 0){
										if(profileAnotherData.status != 0){
											code_http = 114;
										}
									}
									Profilefunc.formatoProfile(profileAnotherData._id,function( profile ){
										Networkfunc.type(profileData._id, profileAnotherData._id,function(statusIsFriendA, dataTypeFriend){
											console.log("Status", profile.profile.status);
											console.log("Friend", statusFriend);
											console.log("IsFriendA", statusIsFriendA);
											var privado = Profilefunc.private(profile.profile.status, statusFriend, statusIsFriendA);
											console.log("Privado", privado);
											Generalfunc.review_check(profileData, profile.profile, function(review_allow, review_date_plus, review_date){
												if(privado){
													privado = 1;
												}else{
													privado = 0;
												}
												console.log("PrivadoN", privado);
												var c = {
													"profile": profile.profile,
													"review": profile.review,
													"trabajo": profile.trabajo,
													"network": profile.network,
													"statusFriend": statusFriend,
													"privado": privado,
													"review_allow": {
														allow: review_allow,
														date_plus: review_date_plus.toString(),
														date: review_date.toString()
													}
												};

												Generalfunc.response(code_http, c, function(response){
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
	if(password != undefined){
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
	}else{
		Generalfunc.response(111,{ },function(response){
			res.json(response);
		});
	}
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

router.post('/registro/experience', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	
	var speciality = req.body.speciality;	
	var ocupation  = req.body.ocupation;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Experiencefunc.specialityExistsOrCreate({
						name: speciality
					}, {
						name: speciality
					}, function(statusSpeciality, specialityData){
						Experiencefunc.jobExistsOrCreate({
							name: ocupation,
							type: 1
						}, {
							name: ocupation,
							type: 1
						}, function(statusJob, jobData){

							profileData.job = {
								id: jobData._id,
								name: jobData.name
							};
							profileData.speciality = {
								id: specialityData._id,
								name: specialityData.name
							};
							profileData.save(function(err, profile){
								Profilefunc.formatoProfile(profileData._id,function( profile ){
									Generalfunc.response(200, profile, function(response){
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
		}else{
			Generalfunc.response(101, {}, function(response){
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
/*
router.post('/update', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	var nombre    = req.body.first_name;
	var apellido  = req.body.last_name;
	var statusReq = req.body.status;
	var job        = req.body.job;
	var speciality = req.body.speciality;	
	var birthday   = req.body.birthday;

});
*/
router.post('/update', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;

	var nombre     = req.body.first_name;
	var apellido   = req.body.last_name;
	var statusReq  = req.body.status;
	var job        = Generalfunc.formatName( req.body.job );
	var speciality = Generalfunc.formatName( req.body.speciality );
	var birthday   = req.body.birthday;
	var phone      = req.body.phone;
	var city       = req.body.city;

	var type       = req.body.type;
	var company    = req.body.company;
	var job        = Generalfunc.formatName( req.body.job );
	var speciality = Generalfunc.formatName( req.body.speciality );
	var sector     = Generalfunc.formatName( req.body.sector );
	var ocupation  = Generalfunc.formatName( req.body.ocupation );

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				profileData.first_name = nombre;
				profileData.last_name  = apellido;
				
				Experiencefunc.specialityExistsOrCreate({
					name: speciality
				}, {
					name: speciality
				}, function(statusSpeciality, specialityData){
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
						
						Experiencefunc.profileGenerate(profileData, function(profileData){
							var job = {
								id: jobData._id,
								name: jobData.name
							};
							var speciality = {
								id: specialityData._id,
								name: specialityData.name
							};
							profileData.job = job;
							profileData.speciality = speciality;
							profileData.status = statusReq;
							profileData.phone  = phone; 

							if(birthday != undefined){
								birthday = explDate(birthday);
								birthday = new Date(birthday);
								
								if(validDate(birthday)){
									profileData.birthday = birthday;
								}
							}
							
							if(mongoose.Types.ObjectId.isValid(city)){
								city = mongoose.Types.ObjectId(city);
								profileData.location.city = city;	
							}
							

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

				Experiencefunc.insertOrExists(profileData, data, function(statusExperience, experienceData){
					
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
router.post('/dedicas', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	var type       = req.body.type;
	var speciality = req.body.speciality;
	var ocupation  = req.body.ocupation;

	speciality     = speciality.trim();
	ocupation      = ocupation.trim();

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				Profile.findOne({
					_id: profileData._id
				}, function(errProfile, profileData){

					async.series([
						function(callback) {

							Experiencefunc.specialityExistsOrCreate({
								name: speciality
							},{
								name: speciality
							}, function(status, specialityData){
								callback(null,specialityData);
							});

						},
						function(callback) {
							Experiencefunc.jobExistsOrCreate({
								name: ocupation,
								type: 0
							},{
								name: ocupation,
								type: 0
							}, function(statusJob, jobData){
								callback(null, jobData);
							});
						}
					], function(err, results) {
						var specialityData = results[0];
						var jobData        = results[1]; 

						var j = profileData.job;
						var s = profileData.speciality;

						if(ocupation != ""){
							j.id   = jobData._id;
							j.name = jobData.name;
						}
						if(speciality != ""){
							s.id   = specialityData._id;
							s.name = specialityData.name;
						}

						profileData.job        = j;
						profileData.speciality = s;

						//profileData.save(function(err, profile){
							Profile.findOne({
								_id: profileData._id
							}).exec(function(err, profileData){
								Generalfunc.response(200, profileData, function(response){
									res.json(response);
								});
							});
						//});
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

	var id         = req.body.id;
	var type       = req.body.type;
	var company    = req.body.company;

	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;


	
	
	

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){

				if(id != undefined){
					if(mongoose.Types.ObjectId.isValid(id)){
						id = mongoose.Types.ObjectId(id);
					}
				}

				var data = {};

				Experiencefunc.companyExistsOrCreate({
					name: company
				}, {
					name: company
				}, profileData, function(statusCompany, companyData){
					
					Experiencefunc.jobExistsOrCreate({
						name: ocupation
					},{
						name: ocupation
					},function(statusJob, ocupationData){
						Experiencefunc.sectorExistsOrCreate({
							name: sector
						},{
							name: sector
						}, function(statusSector, sectorData){

							if(sector != undefined){
								data.sector = {
									id: sectorData._id,
									name: sectorData.name
								};
							}
							if(company != undefined){
								data.company = {
									id: companyData._id,
									name: companyData.name
								};
							}
							if(ocupation != undefined){
								data.ocupation = {
									id:   ocupationData._id,
									name: ocupationData.name
								};
							}
							data.profile_id = profileData._id;
							var find = {};
							if(id != undefined){
								if(mongoose.Types.ObjectId.isValid(id)){
									
									id = mongoose.Types.ObjectId(id);
									
									find = { _id: id };
									Experience.findOne(find).exec(function(err, experienceData){
										
										if(!err && experienceData){
											experienceData.company = data.company;
											experienceData.ocupation = data.ocupation;
											experienceData.save(function(err, experienceData){

												//Historyfunc.generate_history(2,);
												Experiencefunc.profileGenerate(profileData, function(profileData){
													Generalfunc.response(200, profileData, function(response){
														res.json(response);
													});
												});


											});
											
										}else{
											res.json({ a: "a" });
										}
									});
								}else{
									var experienceData = new Experience(data);
									experienceData.save(function(err, experienceData){
										Experiencefunc.profileGenerate(profileData, function(profileData){
											Generalfunc.response(200, profileData, function(response){
												res.json(response);
											});
										});
									});
								}
							}else{
								var experienceData = new Experience(data);
								experienceData.save(function(err, experienceData){
									Experiencefunc.profileGenerate(profileData, function(profileData){
										Generalfunc.response(200, profileData, function(response){
											res.json(response);
										});
									});
								});
							}
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
router.post('/delete-experience', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;

	var id         = req.body.id;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){

				if(id != undefined){
					if(mongoose.Types.ObjectId.isValid(id)){
						id = mongoose.Types.ObjectId(id);

						Experience.findOne({ _id: id }).exec(function(err, experienceData){
							if(!err && experienceData){
								Experience.remove({ _id: experienceData._id }, function(err) {
									Profilefunc.formatoProfile(profileData._id,function( profile ){
										Generalfunc.response(200, profile, function(response){
											res.json(response);
										});
									});
								});	
							}else{
								Generalfunc.response(101, { message: "Experience Unknown" }, function(response){
									res.json(response);
								});
							}
						});
					}
				}else{
					Generalfunc.response(101, { message: "ID Unknown"}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101, { message: "Token Unknown"}, function(response){
				res.json(response);
			});
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

				name = Generalfunc.capitalize(name);
				Skillfunc.ExistsOrCreate({
					name: name
				}, {
					name: name
				}, function(status, skillData){
					
					Profilefunc.findSkill(profileData._id,skillData,function(status, skill){
						
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

							

							if(filter.length > 0){
								format.profileformat(profileData, function(profileData){
									Generalfunc.response(200, profileData, function(response){
										res.json(response);
									});
								});
							}else{
								
								profileData.skills.push(skillData._id);
								profileData.save(function(errProfile, profile){
									Profilefunc.logs(profileData, 15, skillData, function(){
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
		Tokenfunc.exist(guid, function(status, tokenData){
			if(status){
				Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
					Skillfunc.edit(profileData._id, from, to, function(err, profileData){
						Profilefunc.formatoProfile(profileData._id,function( profileData ){
							Generalfunc.response(200, profileData , function(response){
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
					Profilefunc.formatoProfile(profileData._id,function( profileData ){
						Generalfunc.response(200, profileData , function(response){
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
					if(userData.type == 1){
						User.findOne({ _id: userData._id }).exec(function(err, user){
							user.verified = true;
							user.save(function(err, u){
								if(!err && u){
									if(user.verified){
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
									if(user.verified){
										verified = true;
									}



									Profilefunc.logs(profileData, 13, profileData, function(){
										Generalfunc.response(200,{	
											verified: verified
										}, function(response){
											res.json(response);
										});
									});
								}
							});
						});
						
					}else{
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
					}

					

					
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
						
						var profile = format.littleProfile(profileData);

						
						var data = {};
						data = profile;
						
						Generalfunc.response(200, data, function(response){
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
							var spe = false;
							var all = false;

							if(profileData.speciality != undefined){
								if(profileData.speciality.name != undefined){
									spe = true;
								}
							}
							var photo = false;
							if(profileData.profile_pic != undefined || profileData.profile_pic != null){
								photo = true;
							}
							var verified = false;



							if(userData.verified){
								verified = true;
							}
							if(spe || exp){
								all = true;
							}
							Profilefunc.logs(profileData, 14, profileData, function(){
								Network.find({ profiles: { $in:[ profileData._id ] } }).exec(function(errNetwork, networkData){
									Generalfunc.response(200,{
										token: tokenData.generated_id,
										verified: verified,
										experiences: all,
										photo: photo,
										profile: profileData,
										network: networkData
									}, function(response){
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
router.post('/qrcode',multipartMiddleware, function(req, res){
	var guid = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData){
				if(status){
					Profilefunc.generate_qrcode(profileData, function(profileData){

						Generalfunc.response(200, profileData, function(response){
							res.json(response);
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

module.exports = router;

function validDate(d){
	if ( Object.prototype.toString.call(d) === "[object Date]" ) {
		if ( isNaN( d.getTime() ) ) {  // d.valueOf() could also work
			return false;
		}else {
			return true;
		}
	}else {
		return false;
	}
}
function explDate(birthday){
	var x = birthday.split('-');

	var day    = x[0];
	var month  = x[1];
	var year   = x[2];

	return year+"-"+month+"-"+day;
}
function insertUpdateExperience(err, profileData, experienceData, callback){
	if(!err && experienceData){
		Experiencefunc.profileGenerate(profileData, function(profileData){
			callback(true, profileData, experienceData);
		});
		
	}else{
		callback(true, profileData, experienceData);
	}
}