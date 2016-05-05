var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();


var Profile            = require('../models/profile');
var User            = require('../models/user');
var Network         = require('../models/network');


/* GET home page. */
router.post('/connect', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var profile_id = req.body.profile_id;

	func.tokenExist(guid, function(errToken, token){
		if(errToken){
			func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
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

	func.tokenExist(guid, function(errToken, token){
		if(errToken){
			func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
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
router.post('/search', multipartMiddleware, function(req, res){
	var search = req.body.search;
	var reg  = new RegExp(search, "i");
	var data = [];
	func.searchProfile(reg, function(status, profileData){
		profileData.forEach(function(item, index, array, done) {
			data.push(item);

			if(index == (profileData.length-1)){
				func.response(200, data, function(response){
					res.json(response);
				})
			}
		});
	});
});
router.post('/searchinfriends', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var search     = req.body.search;
	var order      = req.body.order;


	var friends = [];
	func.tokenExist(guid, function(errToken, token){
		if(errToken){
			func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
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

module.exports = router;