var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mongoose    = require('mongoose');
var _ = require('underscore');

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

var Generalfunc = require('../functions/generalfunc');
var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Networkfunc = require('../functions/networkfunc');
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
	var public_id = req.body.public_id;

	public_id = mongoose.Types.ObjectId(public_id);
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				console.log("Token");
				Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){
						console.log(profileAnotherData);
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
								var network = new Network({
									accepted: true,
									profiles: [
									profileData._id,
									profileAnotherData._id
									]
								});
								network.save(function(err, networkData){
									var notification = new Notification({
										tipo: 3,
										profile: profileAnotherData._id,
										profile_emisor: profileData._id,
									});
									notification.save(function(errNotification, notificationData){
										var data = {
											"accepted": networkData.accepted,
											"public_id": profileAnotherData.public_id
										};
										Generalfunc.response(200, data,  function(response){
											res.json(response);
										});	
									})
									
								});
							}
						});
					}else{
						res.send("No ProfileAnother");
					}
					
				});
			});
		}else{
			res.send("No Token");
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
									var notification = new Notification({
										tipo: 4,
										profile: profileData._id,
										profile_emisor: profileAnotherData._id,
									});
									notification.save(function(errNotification, notificationData){
										var data = {
											"accepted": network.accepted,
											"public_id": profileAnotherData.public_id
										};
										
										Generalfunc.response(200, data, function(response){
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

					Networkfunc.getFriends(profile_id, function(err, networkData, friendsId){
						if(!err && networkData){
							var query = Profile.find({
								_id:{
									"$in": friendsId
								}
							});
							format.profilequeryformat(query,function(errProfile, profileData){
								Generalfunc.response(200, profileData, function(response){
									res.json(response);
								});
							});
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
	
	User.find({
		"email": { $in: split }
	}, function(userErr, userData){
		console.log(userData);

		var data = [];
		if(userData.length > 0){
			userData.forEach(function(userItem, userIndex){
				Profile.findOne({ user_id: userItem._id}, function(profileErr, profileData){
					data.push(profileData);

					if((userData.length-1) == userIndex){
						Generalfunc.response(200, data, function(response){
							res.json(response);
						});

					}
				});
			});
		}else{
			Generalfunc.response(200, {}, function(response){
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
					console.log(status);
					Profile.find({
						"facebookId": {
							$in: split
						}
					}).exec(function(profileErr, facebookProfileData){
						console.log(facebookProfileData.length);
						if(facebookProfileData.length > 0){
							facebookProfileData.forEach(function(item, index){
								console.log(index);
								Networkfunc.isFriend(profileData._id, facebookProfileData._id, function(d){
									console.log(d);
									var x = {};
									x.profile = item;
									x.isfriend = d;
									facebook[facebook.length] = x;

									if((facebookProfileData.length-1) == index){
										Generalfunc.response(200, facebook, function(response){
											res.json(response);
										});
									}	
								})
								
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
						console.log(facebookProfileData);
						if(!profileErr && facebookProfileData){
							var x = split.indexOf(facebookProfileData.phone);
							split = split.slice(x, 1);
						}

						facebookProfileData.forEach(function(item, index){
							console.log(index);
							
							Networkfunc.isFriend(profileData._id, facebookProfileData._id, function(d){
								console.log(d);
								var x = {};
								x.profile = item;
								x.isfriend = d;
								facebook[facebook.length] = x;

								if((facebookProfileData.length-1) == index){
									Generalfunc.response(200, {profiles: facebook, uknown: split}, function(response){
										res.json(response);
									});
								}	
							})
							
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

// SEARCH NETWORK [Test Seccion Buscador con Secciones(Colmena, Vecina y Otros)]
// Parameter:
//  	Token
//
// Return (Formato 18)
//		
//
router.post('/search', multipartMiddleware, function(req, res){
});
/*
router.post('/search', multipartMiddleware, function(req, res){
	var mi = {
                
                "first_name": "Juan Rael",
                "last_name": "Corrales Arellano",
                "rate": 4.0,
                "experiences": [
                    {
                        "job_name": "Developer",
                    }
                ]
            };
    var vecina = {
                
                "first_name": "Yarull",
                "last_name": "Alvarez",
                "rate": 4.8,
                "experiences": [
                    {
                        "job_name": "Scrum Master",
                    }
                ]
            };
    var otro = {
                
                "first_name": "Memo",
                "last_name": "Palafox",
                "rate": 3.0,
                "experiences": [
                    {
                        "job_name": "Dev",
                    }
                ]
            };
    var mi_g = [];
    var vecinas_g = [];
    var otros_g = [];

    mi_g.push(mi);
    vecinas_g.push(vecina);
    otros_g.push(otro);

	var data = {};
	data.mi = mi_g;
	data.vecinas = vecinas_g;
	data.otros = otros_g;

	
	func.response(200, data, function(response){
		res.json(response)
	});
});
*/
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
	var max        = req.body.max;

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				if(typeof max != "undefined"){
					max = max*1;
					var r = Review.find({ profile_id: profileData._id});
					r = r.limit(max);
				}
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

	history_id        = mongoose.Types.ObjectId(history_id);
	public_id = mongoose.Types.ObjectId(public_id);

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				
				Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){
						Networkfunc.PublicId(public_id, function(statusRecomend, profileRecomendData){
							if(statusRecomend){
								var notification = new Notification({
									tipo: 1, // 0 = se ha unido | 1 = recomendación | 2 = share contacto | 3 = Envio Solucitud | 4 = Respondio Solicitud
									profile: profileAnotherData._id,
									profile_emisor: profileData._id,
									profile_mensaje: profileRecomendData._id,
									busqueda: history_id
								});
								notification.save(function(errNotification, notificationData){
									var data = {
										profile_emisor: profileData.public_id,
										profile_mensaje: profileRecomendData.public_id,
										busqueda: history_id
									};
									Generalfunc.response(200, data, function(response){
										res.json(response);
									});
								});
							}else{

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

module.exports = router;