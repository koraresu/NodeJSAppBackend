var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();


var Profile            = require('../models/profile');
var User            = require('../models/user');
var Network         = require('../models/network');

var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Networkfunc = require('../functions/networkfunc');
/* GET home page. */
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
router.post('/message', multipartMiddleware, function(req, res){
	var text = req.body.text;
	var profile_a = req.body.a_profile;
	var profile_a = req.body.b_profile;
});
router.post('/check/conversation', multipartMiddleware, function(req, res){
	var text = req.body.text;
	var profile_a = req.body.a_profile;
	var profile_b = req.body.b_profile;


	Networkfunc.checkconversation(profile_a,profile_b, function(status, conversationData){

		func.response(200, conversationData, function(response){
			res.json(response);
		})
	});
});
/*
router.post('/search', multipartMiddleware, function(req, res){
	var search = req.body.search;
	var reg  = new RegExp(search, "i");
	var data = [];
	func.searchProfile(reg, function(status, profileData){
		profileData.forEach(function(item, index, array, done) {
			data.push(item);
			if(index == (profileData.length-1)){
				func.response(200, {"mi": data}, function(response){
					res.json(response);
				})
			}
		});
	});
});
*/
router.post('/search', multipartMiddleware, function(req, res){
	var mi = {
                "_id": "573230e4b0a0a7421af5ef9f",
                "updatedAt": "2016-05-18T18:06:51.124Z",
                "createdAt": "2016-05-10T19:05:08.448Z",
                "first_name": "Juan Rael",
                "last_name": "Corrales Arellano",
                "user_id": "573230e4b0a0a7421af5ef9c",
                "__v": 40,
                "birthday": "1980-06-12T06:00:00.000Z",
                "profile_pic": "573230e4b0a0a7421af5ef9f.png",
                "status": 1,
                "info": [
                    {
                        "value": "Juan",
                        "name": "first_name"
                    },
                    {
                        "value": "Corrales",
                        "name": "last_name"
                    },
                    {
                        "value": "Juan Rael Corrales",
                        "name": "name"
                    },
                    {
                        "value": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/11813405_10207478275257749_1388270640230694431_n.jpg?oh=7ea3d9f41a819e731b74c78af7c0715d&oe=579F0ED7",
                        "name": "picture"
                    },
                    {
                        "value": "rkenshin21@gmail.com",
                        "name": "email"
                    }
                ],
                "skills": [
                    {
                        "name": "PHP",
                        "_id": "57335dc763ae5d8505edd408"
                    },
                    {
                        "name": "php",
                        "_id": "573caea729becfd519602a76"
                    },
                    {
                        "name": " javascript",
                        "_id": "573caea729becfd519602a77"
                    },
                    {
                        "name": " it",
                        "_id": "573caea729becfd519602a78"
                    }
                ],
                "experiences": [
                    {
                        "speciality_name": "Fullstack Developer",
                        "company_name": "Axovia",
                        "ocupation_name": "Diseño Web",
                        "job_name": "Developer",
                        "_id": "57335485a5cbe5540481f2d2"
                    }
                ]
            };
    var mi_g = [];
    var vecinas_g = [];
    var otros_g = [];

    mi_g.push(mi);
    vecinas_g.push(mi);
    otros_g.push(mi);

	var data = {};
	data.mi = mi_g;
	data.vecinas = vecinas_g;
	data.otros = otros_g;

	
	func.response(200, data, function(response){
		res.json(response)
	});
});
router.post('/searchinfriends', multipartMiddleware, function(req, res){
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
router.post('/review', multipartMiddleware, function(req, res){
	
})
module.exports = router;