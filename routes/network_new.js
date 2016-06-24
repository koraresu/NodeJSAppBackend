var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var _ = require('underscore');

var router = express.Router();

/*
	CARGA COMPLETA
*/

var Profile            = require('../models/profile');
var User            = require('../models/user');
var Network         = require('../models/network');

var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Networkfunc = require('../functions/networkfunc');


// CONNECT
// Parameter:
//  	Token
//
// Return (Formato 14)
//		Network
// 		Profile
router.post('/connect', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var profile_id = req.body.profile_id;

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				func.ProfileId(profile_id, function(errProfileAnotherData,profileAnotherData){
					var find = {
						"profiles": {
							"$all": [profileData._id,profileAnotherData._id],
						}
					};
					console.log(find);
					Network.findOne(find, function(errNetwork, networkData){
						if(!errNetwork && networkData){
							func.response(200, networkData, function(response){
								res.json(response);
							});
						}else{
							var network = new Network({
								accepted: false,
								profiles: [
									profileData._id,
									profileAnotherData._id
								]
							});
							network.save(function(err, networkData){
								func.response(200, networkData, function(response){
									res.json(response);
								});
							});
						}
					});
				});
			});
		}else{

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
	var profile_id = req.body.profile_id;

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				func.ProfileId(profile_id, function(errProfileAnotherData,profileAnotherData){


					var find = {
						"profiles": {
							"$all": [profileData._id,profileAnotherData._id],
						}
					};
					Network.findOne(find, function(errNetwork, networkData){
						if(!errNetwork && networkData){
							networkData.accepted = true;
							networkData.save(function(err, network){
								func.response(200, network, function(response){
									res.json(response);
								});
							});
						}else{
							func.response(101, {}, function(response){
								res.json(response);
							});
						}
					});
				});
			});
		}else{

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
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					var data = [];
					var profile_id = profileData._id
					Network.find({
						"profiles": {
							"$in": [profile_id]
						}
					}).exec(function(errNetwork, networkData){
						networkData.forEach(function(item, index){
							var a = ""

							console.log(item.profiles);
							if(item.profiles[0] == profile_id){
								a = item.profiles[0];
							}else{
								a = item.profiles[1];
							}
							console.log(a);
							Profile.findOne({ _id: a }).exec(function(errProfile, profileDataAnother){
								var d = [];
								d = _.extend(item, { profile: profileDataAnother });
								data.push(d);

								if(index == (networkData.length-1)){
									func.response(200, data, function(response){
										res.json(response);
									});
								}
							});


						});
					});
				}else{
					res.send("No Token")
				}
				
			});
		}else{
			console.log("No Token");
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
							func.response(200, data, function(response){
								res.json(response);
							});
							
						}
					});
				});
			}else{
				func.response(200, {}, function(response){
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
	var mi = {
                
                "first_name": "Juan Rael",
                "last_name": "Corrales Arellano",
                "experiences": [
                    {
                        "job_name": "Developer",
                    }
                ]
            };

    var mi_g = [];
    var vecinas_g = [];
    var otros_g = [];

    mi_g.push(mi);
    mi_g.push(mi);
    vecinas_g.push(mi);
    otros_g.push(mi);
    otros_g.push(mi);

	var data = {};
	data.mi = mi_g;
	data.vecinas = vecinas_g;
	data.otros = otros_g;

	
	func.response(200, data, function(response){
		res.json(response)
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
