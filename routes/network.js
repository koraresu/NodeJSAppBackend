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
						$or: [
							{
								"profile_a":{
									id:[
										profileData._id,
										profileAnotherData._id
									]
								}
							},
							{
								"profile_b":{
									id:[
										profileData._id,
										profileAnotherData._id
									]
								}
							},
						]
					};
					Network.find(find, function(errNetwork, networkData){
						res.json(find);
					});
					
				});
			});
		}
	});
});
router.post('/send', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var profile_id = req.body.profile_id;

	func.tokenExist(guid, function(errToken, token){
		if(errToken){
			func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				func.ProfileId(profile_id, function(errProfileAnotherData,profileAnotherData){

					var friend = Network({
						accepted: false,
						profile_a:{
							id: profileData._id,
							profile: profileData
						},
						profile_b:{
							id: profileAnotherData._id,
							profile: profileAnotherData
						}
					});
					friend.save();
					res.json(friend);
				});
			});
		}
	});
});
module.exports = router;