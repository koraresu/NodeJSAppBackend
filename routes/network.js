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
var Online       = model.online;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var format             = require('../functions/format');

var Generalfunc      = require('../functions/generalfunc');
var Profilefunc      = require('../functions/profilefunc');
var Experiencefunc   = require('../functions/experiencefunc');
var Tokenfunc        = require('../functions/tokenfunc');
var Skillfunc        = require('../functions/skillfunc');
var Networkfunc      = require('../functions/networkfunc');
var Notificationfunc = require('../functions/notificationfunc');
/* GET home page. */




// CONNECT
// Parameter:
//  	Token
//
// Return (Formato 14)
//		Network
// 		Profile
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
						console.log(find);
						Network.findOne(find, function(errNetwork, networkData){
							if(!errNetwork && networkData){
								Generalfunc.response(200, networkData, function(response){
									res.json(response);
								});
							}else{
								var accepted = false;
								if(section == "gps"){
									accepted = true;
								}
								var network = new Network({
									accepted: accepted,
									profiles: [
									profileData._id,
									profileAnotherData._id
									]
								});
								network.save(function(err, networkData){
									Network.findOne({ _id: networkData._id}).populate('profiles').exec(function(errNetwork, networkData){
											

										Notificationfunc.add({
                  							tipo: 3,
                  							profile: profileAnotherData._id,
											profile_emisor: profileData._id,
											network: networkData._id,
											clicked: false,
                  							status: false,
                						}, function(status, notificationData){
                							var data = {
												"accepted": networkData.accepted,
												"public_id": profileAnotherData.public_id
											};
											Generalfunc.response(200, data,  function(response){
												res.json(response);
											});	
                						});
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
								console.log(profileAnotherData);
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
										var network = new Network({
											accepted: false,
											profiles: [
											profileData._id,
											profileAnotherData._id
											]
										});
										network.save(function(err, networkData){

											Notificationfunc.add({
	                  							tipo: 3,
	                  							profile: profileAnotherData._id,
												profile_emisor: profileData._id,
												network: networkData._id,
												clicked: true,
	                  							status: true
                							}, function(status, notificationData){
                								Network.findOne({ _id: networkData._id }).populate('profiles').exec(function(err, networkData){
													var data = {
														"accepted": networkData.accepted,
														"public_id": profileAnotherData.public_id,
														"data": networkData
													};
													callback(null, data);
												});
                							});
											var notification = new Notification({
												tipo: 3,
												
											});
											notification.save(function(errNotification, notificationData){
												
												
											});
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
					Generalfunc.response(200, results, function(response){
						console.log("B");
						res.json(response);
					});
				});
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				console.log("C");
				res.json(response);
			});
		}
	});






});
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
// ACCEPT
// Parameter:
//  	Token
// 		Profile Id
//
// Return (Formato 15)
//		Network
// 		Profile
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

										
									});
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
// UNFRIEND
// Parameter:
//  	Token
//
// Return (Formato 16)
//		Network
// 		Profile
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
									"$all": [profileData._id,profileAnotherData._id],
								}
							};
							Network.findOne(find).exec(function(errNetwork, networkData){

								Network.remove({ _id: networkData._id }, function(err) {
									if (!err) {
										Generalfunc.response(200, { data: networkData, status:"deleted"}, function(response){
											res.json(response);
										});
									} else {
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
/*
	var guid       = req.body.guid;
	var public_id = req.body.public_id;

	public_id = mongoose.Types.ObjectId(public_id);
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				console.log("Token");
				Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){
						var find = {
							"profiles": {
								"$all": [profileData._id,profileAnotherData._id],
							}
						};
						Network.findOne(find).exec(function(errNetwork, networkData){
							if(!errNetwork && networkData){
								if(networkData != null){

									var log = new Log({
										message: "unfriend",
										data: networkData
									});
									log.save(function(){
										networkData.remove(function(err, data){
											Generalfunc.response(200, networkData, function(response){
												res.json(response);
											});
										});;
									});

								}else{
									Generalfunc.response(404, {}, function(response){
										res.json(response);
									});
								}
							}else{
								Generalfunc.response(404, {}, function(response){
									res.json(response);
								});
							}
						});
					}else{
						Generalfunc.response(113, {}, function(response){
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
});
*/
// GET
// Parameter:
//  	Token
//
// Return (Formato 16)
//		Network
// 		Profile
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
// EMAIL TO FRIEND
// Parameter:
//  	Token
// 		EMAIL (lista dividida con , )
//
// Return (Formato 17)
//		Profile
//
router.post('/emailtofriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var emails     = req.body.emails;


	var split = emails.split(',');
	
	console.log(split);
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData){
				if(status){
					User.find({
						"email": { $in: split }
					}, function(userErr, userData){
						var data = [];
						if(userData.length > 0){

							async.map(userData, function(item, callback){
								Profile.findOne({ user_id: item._id }).populate('user_id').exec(function(profileErr, emailProfileData){
									var x = split.indexOf(emailProfileData.user_id.email);
									delete split[x];
									Networkfunc.isFriend(profileData._id, emailProfileData._id, function(d){
										var x = {
											profile: emailProfileData,
											isFriend: d
										};
										console.log(x);
										callback(null, x);
									});
								});
							}, function(err, results){
								console.log(split);
								split = cleanArray(split);
								
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
router.post('/facebooktofriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var facebookids     = req.body.facebookid;
	var split = facebookids.split(',');
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData){
				if(status){
					var facebook = [];
					var v = {
						"facebookId": {
							$in: split
						}
					};
					Profile.find(v).exec(function(profileErr, facebookProfileData){
						if(facebookProfileData.length > 0){
							async.map(facebookProfileData, function(item, callback){
								Networkfunc.isFriend(profileData._id, item._id, function(d){
									console.log("ProfileData:");
									console.log(profileData._id);
									console.log("Facebook Profile Data");
									console.log(item._id);
									console.log("Friend:");
									console.log(d);
									var x = {
										profile: item,
										isFriend: d
									};
									callback(null, x);
								});
							}, function(err, results){
								split = cleanArray(split);
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
router.post('/phonetofriend', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var phones     = req.body.phones;

	console.log(phones);

	var split = phones.split(',');

	console.log(split);

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
							var x = split.indexOf(item.phone);
							delete split[x];

							console.log(item);

							Networkfunc.isFriend(profileData._id, item._id, function(d){
								var x = {
									profile: item,
									isFriend: d
								};

								console.log(x);

								callback(null, x);
							});
						}, function(err, results){
							console.log(results);
							split = cleanArray(split);
							Generalfunc.response(200, {profiles: results, uknown: split}, function(response){
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
// SEARCH NETWORK
// Parameter:
//  	Token
// 		Text
// 		ORDER (No Usado)
//
// Return (Formato 19)
//		
//
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
// REVIEW
// Parameter:
//  	Token
// 		Titulo
// 		Contenido
// 		Calificación
//
// Return (Formato 20)
//		
//
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
// GET REVIEW
// Parameter:
//  	Token
//
// Return (Formato 20)
//		
//
router.post('/review/get', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var page       = req.body.page;
	var perPage    = 20;

	if(page == undefined){
		page = 0;
	}
	page = isNormalInteger(page);


	var pagination = 0;
	if(page != 0){
		pagination = page*perPage;
	}
	

	console.log(pagination);

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				var r = Review.find({ profile_id: profileData._id});
				r = r.limit(perPage);
				r = r.skip( pagination );

				console.log("perPage:"+perPage);
				console.log("Page:"+perPage*page);
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
// SEND RECOMENDACIÓN
// Parameter:
//		Token
//		Busqueda
//
// Return (Formato 21)
//
//
router.post('/recomendar', multipartMiddleware, function(req, res){
	var guid          = req.body.guid;
	var public_id     = req.body.public_id;
	var p_recomend_id = req.body.recomendar_id;
	var history_id    = req.body.history_id;

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
	console.log("HistoryID:");
	console.log(history_id);

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

												Generalfunc.profiletosocket(profileAnotherData._id, function(err, sockets){
												if(sockets.length > 0){
													sockets.forEach(function(item, index){
														req.io.to('/#' + item).emit('recomendar', data); 
														if((socket.length-1) == index){
															Generalfunc.response(200, data, function(response){
																res.json(response);
															});	
														}
														
													});
												}else{
													Generalfunc.response(200, data, function(response){
																res.json(response);
															});	
												}
												
											});
											});
										}else{
											var data = {
												profile: profileAnotherData,
												profile_emisor: profileData,
												profile_mensaje: profileRecomendData,
											};

											Generalfunc.profiletosocket(profileAnotherData._id, function(err, sockets){
												if(sockets.length > 0){
													sockets.forEach(function(item, index){
														req.io.to('/#' + item).emit('recomendar', data); 
														if((socket.length-1) == index){
															Generalfunc.response(200, data, function(response){
																res.json(response);
															});	
														}
														
													});
												}else{
													Generalfunc.response(200, data, function(response){
																res.json(response);
															});	
												}
												
											});
										}
										
									});
								});
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

function create_notificacion_recomendacion(data, callback){
	if(data.busqueda == undefined){
		Notificationfunc.add(data, callback);	
	}else{
		Notificationfunc.add(data,callback);	
	}
}
function cleanArray(actual) {
	var newArray = new Array();
	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}
	return newArray;
}
function isNormalInteger(str) {
	var n = ~~Number(str);
	return String(n) === str && n >= 0;
}
function NotificationSocketSend(profile_id, success){

}