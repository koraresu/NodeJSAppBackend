/**
 * Las rutas de las conexiones entre Usuarios. Network.
 *
 * @module Rutas
 */
var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mongoose    = require('mongoose');
var _ = require('underscore');
var async = require('async');
var router = express.Router();

var model              = require('../model');

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

var format             = require('../functions/format');
var Generalfunc        = require('../functions/generalfunc');
var Profilefunc        = require('../functions/profilefunc');
var Experiencefunc     = require('../functions/experiencefunc');
var Tokenfunc          = require('../functions/tokenfunc');
var Skillfunc          = require('../functions/skillfunc');
var Networkfunc        = require('../functions/networkfunc');
var Notificationfunc   = require('../functions/notificationfunc');
/**
 * Route "/connect", Hace la conexion entre el usuario que hizo la peticion, y otro usuario(public_id).
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, Es el public de otro usuario para hacer la conexion.
 * @param {String} section, Esta se hizo para diferenciar entre las peticiones de "Agregar Colmena" y de "GPS"(estas se aceptaban por defecto).
 * @return {Object}  { accepted, public_id}
 *
 */
router.post('/connect', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var public_id  = req.body.public_id;
	var section    = req.body.section;
	
	if(mongoose.Types.ObjectId.isValid(public_id)){
		public_id = mongoose.Types.ObjectId(public_id);
		Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){

						var find = {
							"profiles": {
								"$all": [profileData._id,profileAnotherData._id],
							}
						};
						
						Network.findOne(find, function(errNetwork, networkData){
							if(!errNetwork && networkData){
								Generalfunc.response(200, networkData, function(response){
									res.json(response);
								});
							}else{
								Networkfunc.create(profileData, profileAnotherData, function(networkData, notificationData){
									var data = {
										"accepted": networkData.accepted,
										"public_id": profileAnotherData.public_id,
										"notificaton": notificationData
									};
									Generalfunc.response(200, data,  function(response){
										res.json(response);
									});	
								}, function(err){
									Generalfunc.response(101, {}, function(response){
										res.json(response);
									});
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
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
		});
	}
});
/**
 * Route "/connect/all", Es igual, solo que hace el envio de solicitudes a muchos usuarios.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {Array[String]} public_id, se reciben los public_id divididos por comas.
 * @return {Object} resultado del envio de correo.
 *
 */
router.post('/connect/all', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var public_id = req.body.public_id;
	

	var split = public_id.split(',');

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){

				async.map(split, function(item, callback){
					var element = item.trim();
					if(mongoose.Types.ObjectId.isValid(element)){
						public_id = mongoose.Types.ObjectId(element);
						Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
							if(statusPublic){
								
								var find = {
									"profiles": {
										"$all": [profileData._id,profileAnotherData._id],
									}
								};
								
								Network.findOne(find).populate('profiles').exec(function(errNetwork, networkData){
									if(!errNetwork && networkData){
										var data = {
											"accepted": networkData.accepted,
											"public_id": profileAnotherData.public_id,
											"data": networkData
										};
										callback(null, data);
									}else{

										Networkfunc.create(profileData, profileAnotherData, function(networkData, notificationData){
											var data = {
												"accepted": networkData.accepted,
												"public_id": profileAnotherData.public_id,
												"notificaton": notificationData
											};
											callback(null, data);
										}, function(err){
											callback(null, null);
										});
									}
								});
							}else{
								callback(null, null);
							}
						});
					}else{
						callback(null, null);
					}
				}, function(err, results){
					results = Generalfunc.cleanArray( results );
					Generalfunc.response(200, results, function(response){
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
});
/**
 * Route "/email/invite", Envia invitación por correos.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} emails, recibo los correos divididos por comas.
 * @return {Object}  { accepted, public_id}
 *
 */
router.post('/email/invite', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var emails     = req.body.emails;
	

	var split = emails.split(',');
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				async.map(split, function(item, callback){
					var e = item.trim();
					Generalfunc.sendEmail("emailinvite.jade", {
						email: e,
						nombre_invita: profileData.first_name+" "+profileData.last_name,
						email_invita:  userData.email
					}, e, "Hola, te invitamos a TheHive, ",function(status, html){
						if(status){
							callback(null, { email: e, status: status});
						}else{
							callback(null, { email: e, status: status});
						}
					});
				}, function(err, results){
					Generalfunc.response(200, results, function(response){
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
});
/**
 * Route "/accept", Aceptas una solicitud de un Amigo. busca en al DB "Network" y en "Notification", los registros entre estos dos.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, el public_id de la otra persona.
 * @return {Object}  { accepted, public_id}
 *
 */
router.post('/accept', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var public_id = req.body.public_id;

	public_id = mongoose.Types.ObjectId(public_id);

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				
				Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){


						var find = {
							"profiles": {
								"$all": [profileData._id,profileAnotherData._id],
							}
						};
						Network.findOne(find, function(errNetwork, networkData){
							if(!errNetwork && networkData){
								networkData.accepted = true;
								networkData.save(function(err, network){
									Notificationfunc.add({
										tipo: 4,
										profile: profileAnotherData._id,
										profile_emisor: profileData._id,
										network: networkData._id,
										status: true,
										click: true
									},function(errNotification, notificationData){
										Notification.findOne({ tipo: 3, network: networkData._id }).exec(function(err, notificationPreData){
											if(!err && notificationPreData){
												notificationPreData.clicked = true;
												notificationPreData.status = networkData.accepted;
												notificationPreData.save(function(err, notiPre){
													var data = {
														"accepted": network.accepted,
														"public_id": profileAnotherData.public_id
													};
													Generalfunc.response(200, data, function(response){
														res.json(response);
													});
												});	
											}else{
												Generalfunc.response(101, { message: "No se encuentra la Notificación."}, function(response){
													res.json(response);
												});
											}
											
										});

										
									}, req.app.io);
								});
							}else{
								Generalfunc.response(101, {}, function(response){
									res.json(response);
								});
							}
						});

					}else{

					}
				});
			});
		}else{

		}
	});
});
/**
 * Route "/isfriend", Revisa si el usuario que hace la peticion es amigo de otro usuario.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, el public_id de la otra persona.
 * @return {JSON}  Status.
 *
 */
router.post('/isfriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var public_id = req.body.public_id;

	public_id = mongoose.Types.ObjectId(public_id);

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				
				Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){
						Networkfunc.isFriend(profileData._id, profileAnotherData._id, function(status){
							Generalfunc.response(200, {
								status: status
							}, function(response){
								res.json(response);
							});
						});
					}else{
						Generalfunc.response(101, {}, function(response){
							res.json(response);
						});
					}
				});
			});
		}else{

		}
	});
});
/**
 * Route "/unfriend", Busca en la db y elimina la "Amistad" entre estos dos.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, el public_id de la otra persona.
 * @return {JSON}  los datos eliminados de network, y el estado.
 *
 */
router.post('/unfriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var public_id = req.body.public_id;

	if(mongoose.Types.ObjectId.isValid(public_id)){
		public_id = mongoose.Types.ObjectId(public_id);
		Tokenfunc.exist(guid, function(errToken, token){
			if(errToken){
				Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
					Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
						if(statusPublic){
							var find = {
								"profiles": {
									"$all": [
										profileData._id,
										profileAnotherData._id
									]
								}
							};
							Network.findOne(find).exec(function(errNetwork, networkData){
								Conversation.find(find).remove().exec(function(errConv, convData){
									Notification.find({
										"$or": [
											{
												"profile": profileData._id,
    											"profile_emisor": profileAnotherData._id
											},
											{
												"profile": profileAnotherData._id,
    											"profile_emisor": profileData._id
											}
										]
									}).remove().exec(function(){
										Network.remove({ _id: networkData._id }, function(err) {
											if (!err) {
												Generalfunc.response(200, {
													data: networkData,
													status:"deleted"
												}, function(response){
													res.json(response);
												});
											} else {
												Generalfunc.response(101, {}, function(response){
													res.json(response);
												});
											}
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
/**
 * Route "/get", Obtienes la lista de "Conexiones de Amigos".
 * @param {String} guid, Token del Perfil(permiso).
 * @return {JSON}
 *
 */
router.post('/get', multipartMiddleware, function(req, res){
	var guid = req.body.guid;

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData){
				if(status){
					var data = [];
					var profile_id = profileData._id;

					Network.find({
						profiles: {
							$in: [profileData._id]
						}
					}).select('-__v -updatedAt').populate('profiles').exec(function(err, networkData){
						Generalfunc.response(200, networkData, function(response){
							res.json(response);
						});
						
					});
				}else{
					Generalfunc.response(113, {}, function(response){
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
/**
 * Route "/emailtofriend", Recibe una lista de emails, y los busca en el sistema, si existen regresa el perfil, si no, regresa el correo.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} emails, lista de emails a buscar separados por comas.
 * @return {JSON} { profiles, uknown }
 *
 */
router.post('/emailtofriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var emails     = req.body.emails;


	var split = emails.split(',');
	split = split.map(Function.prototype.call, String.prototype.trim);

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userMeData, profileData){
				if(status){
					User.find({
						"email": { $in: split }
					}, function(userErr, userData){
						var data = [];
						if(userData.length > 0){

							async.map(userData, function(item, callback){
								Profile.findOne({ user_id: item._id }).populate('user_id').exec(function(profileErr, emailProfileData){
									console.log( profileData._id.toString() + " | " + item._id.toString() );

									if(userMeData.email == item.email){
										var x = split.indexOf(emailProfileData.user_id.email);
										delete split[x];
										callback(null, null);
									}else{
										var x = split.indexOf(emailProfileData.user_id.email);
										delete split[x];
										Networkfunc.isFriend(profileData._id, emailProfileData._id, function(d){
											var x = {
												profile: emailProfileData,
												isFriend: d
											};
										
											callback(null, x);
										});
									}
								});
							}, function(err, results){
								results = Generalfunc.cleanArray( results );
								split   = Generalfunc.cleanArray( split );
								
								Generalfunc.response(200, { profiles: results, uknown: split }, function(response){
									res.json(response);
								});
							});
						}else{
							Generalfunc.response(200, { profiles:[], uknown: split}, function(response){
								res.json(response);
							});
						}
					});
				}else{
					Generalfunc.response(101, { message: "No Profile"}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101, { message: "No Exists Token" }, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/emailtofriend", Recibe una lista de facebookids, y los busca en el sistema, si existen regresa el perfil, si no, regresa el ID de Facebook.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} facebookid, lista de facebookid a buscar separados por comas.
 * @return {JSON} { profiles, uknown }
 *
 */
router.post('/facebooktofriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var facebookids     = req.body.facebookid;
	
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData){
				if(status){
					var facebook = [];

					if(facebookids.indexOf(',') > -1 || facebookids.length > 0){
						var split = facebookids.split(',');
						var v = {
							"facebookId": {
								$in: split
							}
						};
						Profile.find(v).exec(function(profileErr, facebookProfileData){
							if(facebookProfileData.length > 0){
								async.map(facebookProfileData, function(item, callback){
									Networkfunc.isFriend(profileData._id, item._id, function(d){
										
										
										
										
										
										
										var x = {
											profile: item,
											isFriend: d
										};
										callback(null, x);
									});
								}, function(err, results){
									split = Generalfunc.cleanArray(split);
									Generalfunc.response(200, {profiles: results, uknown: split}, function(response){
										res.json(response);
									});
								});
							}else{
								Generalfunc.response(200, {profiles: [], uknown: split}, function(response){
									res.json(response);
								});
							}
						});
					}else{
						Generalfunc.response(200, {profiles: [], uknown: []}, function(response){
							res.json(response);
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
/**
 * Route "/emailtofriend", Recibe una lista de Teléfonos, y los busca en el sistema, si existen regresa el perfil, si no, regresa el teléfono.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} telefonos, lista de teléfonos a buscar separados por comas.
 * @return {JSON} { profiles, uknown }
 *
 */
router.post('/phonetofriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var phones     = req.body.phones;

	

	var split = phones.split(',');

	

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData){
				if(status){

					var facebook = [];
					Profile.find({
						"phone": {
							$in: split
						}
					}).exec(function(profileErr, facebookProfileData){

						async.map(facebookProfileData, function(item, callback){
							if(profileData._id.toString() != item._id.toString() ){
								var x = split.indexOf(item.phone);
								delete split[x];
								Networkfunc.isFriend(profileData._id, item._id, function(d){
									var x = {
										profile: item,
										isFriend: d
									};
									callback(null, x);
								});
							}else{
								callback(null, null);
							}
						}, function(err, results){
							
							split   = Generalfunc.cleanArray( split );
							results = Generalfunc.cleanArray( results );
							err     = Generalfunc.cleanArray( err );

							Generalfunc.response(200, { profiles: results, uknown: split }, function(response){
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
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}

	});
});
/**
 * Route "/search/friends". (**)
 *
 */
router.post('/search/friends', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var search     = req.body.search;
	var order      = req.body.order;


	var friends = [];
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				Network.find({
					"profiles": {
						"$in": [profileData._id]
					}
				}, function(errNetwork, networkData){
					if(!errNetwork && networkData){

						networkData.forEach(function(friendData, index){
							var profile_id;
							if(friendData.profiles[0] == profileData._id){
								friends.push( friendData.profiles[1] );
							}else{
								friends.push( friendData.profiles[0] );
							}

							if(index == (networkData.length-1)){
								friends.forEach(function(friend,indexFriend){
									
								});
								res.json(friends);

							}
						});
						
					}else{
						res.send("No existe");
					}
				});
			});
		}else{

		}
	});
});
/**
 * Route "/review", (**)
 *
 */
router.post('/review', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var title   = req.body.title;
	var content = req.body.content;
	var rate    = req.body.rate;

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				var profiles = [];
				profiles.push(profileData._id);
				profiles.push( mongoose.Types.ObjectId("57626c974dc05ed852276ed3") );


				var review = new Review({
					title:      title,
					content:    content,
					rate:       rate,	
					profiles: profiles,
					profile_id: profileData._id
				});
				review.save(function(errReview, reviewData){
					Generalfunc.response(200, reviewData, function(response){
						res.json(response);
					});
				})
			});
		}else{

		}
	});
});
/**
 * Route "/review/get", Recibe una lista de Teléfonos, y los busca en el sistema, si existen regresa el perfil, si no, regresa el teléfono.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} telefonos, lista de teléfonos a buscar separados por comas.
 * @return {JSON}
 *
 */
router.post('/review/get', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var page       = req.body.page;
	var perPage    = 20;

	if(page == undefined){
		page = 0;
	}
	page = Generalfunc.isNormalInteger(page);


	var pagination = 0;
	if(page != 0){
		pagination = page*perPage;
	}
	

	

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				var r = Review.find({ profile_id: profileData._id});
				r = r.limit(perPage);
				r = r.skip( pagination );

				
				
				r.exec(function(errReview, reviewData){
					Generalfunc.response(200, reviewData, function(response){
						res.json(response);
					});
				});
			});
		}else{

		}
	});
});
/**
 * Route "/recomendar", Crear recomendaciones, Sobre una peticion de recomendación.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, Id de Usario a quien se lo Recomiendas.
 * @param {String} recomendar_id, Id de Usuario a Recomendar.
 * @param {String} history_id, 
 * @return {JSON}
 *
 */
router.post('/recomendar', multipartMiddleware, function(req, res){
	var guid           = req.body.guid;
	var public_id      = req.body.public_id;
	var p_recomend_id  = req.body.recomendar_id;
	var history_id     = req.body.history_id;

	var d = {};// Notificación a persona recibe recomendación.
	var e = {};// Notificación a persona recomiendan. 

	if(mongoose.Types.ObjectId.isValid(history_id)){
		history_id        = mongoose.Types.ObjectId(history_id);	
	}
	if(mongoose.Types.ObjectId.isValid(public_id)){
		public_id = mongoose.Types.ObjectId(public_id);
	}
	if(mongoose.Types.ObjectId.isValid(p_recomend_id)){
		p_recomend_id = mongoose.Types.ObjectId(p_recomend_id);
	}
	
	

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				
				Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){
						Networkfunc.PublicId(p_recomend_id, function(statusRecomend, profileRecomendData){
							if(statusRecomend){

								d.tipo = 1;

								d.profile         = profileAnotherData._id;
								d.profile_emisor  = profileData._id;
								d.profile_mensaje = profileRecomendData._id;

								e.tipo            = 2;
								e.profile         = profileRecomendData._id;
								e.profile_emisor  = profileData._id;
								e.profile_mensaje = profileAnotherData._id;

								if(mongoose.Types.ObjectId.isValid(history_id)){
									d.busqueda = history_id;
									e.busqueda = history_id;
								}


								create_notificacion_recomendacion(e, function(statusAn, notificationAnData){
									create_notificacion_recomendacion(d, function(status, notificationData){
										if(mongoose.Types.ObjectId.isValid(history_id)){
											History.findOne({ _id: history_id}).exec(function(err, historyData){
												
												var data = {
													profile: profileAnotherData._id,
													profile_emisor: profileData,
													profile_mensaje: profileRecomendData,
													busqueda: historyData
												};

												Generalfunc.response(200, data, function(response){
													res.json(response);
												});
											});
										}else{
											var data = {
												profile: profileAnotherData,
												profile_emisor: profileData,
												profile_mensaje: profileRecomendData,
											};

											Generalfunc.response(200, data, function(response){
												res.json(response);
											});
										}
										
									}, req.app.io);
								}, req.app.io);
							}else{
								Generalfunc.response(101, {}, function(response){
									res.json( response );
								});
							}
						});
					}else{
						Generalfunc.response(101, {}, function(response){
							res.json( response );
						});
					}
				});
			} );
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json( response );
			});
		}
	});
});
module.exports = router;

function create_notificacion_recomendacion(data, callback, io){
	Notificationfunc.add(data, function(status, notificationData){
		callback(status, notificationData);
	}, io);
}