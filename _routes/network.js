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
router.post('/search', multipartMiddleware, function(req, res){
	var search = req.body.search;
	var profile1 = {
			"_id": "5710124d2a2823ce06270ad1",
			"updatedAt": "2016-04-23T07:12:48.715Z",
			"createdAt": "2016-04-14T21:57:33.129Z",
			"first_name": "Rael",
			"last_name": "Corrales",
			"user_id": "5710124d2a2823ce06270ace",
			"__v": 0,
			"profile_pic": "5710124d2a2823ce06270ad1.jpg",
			"profile_hive": "5710124d2a2823ce06270ad1_hive.png"
		};
	var profile2 = {
	    "_id" : "571dc1712fed47f924de5010",
	    "updatedAt" : "2016-04-25T07:06:03.165Z",
	    "createdAt" : "2016-04-25T07:04:17.385Z",
	    "first_name" : "Yarull",
	    "last_name" : "Álvarez",
	    "user_id" : "571dc1712fed47f924de500d",
	    "__v" : 0,
	    "profile_hive" : "571dc1712fed47f924de5010_hive.png",
	    "profile_pic" : "571dc1712fed47f924de5010.jpg"
	};
	var profile3 = {
	    "_id" : "5727966450e9446d0e8871b8",
	    "updatedAt" : "2016-05-02T18:03:16.789Z",
	    "createdAt" : "2016-05-02T18:03:16.789Z",
	    "first_name" : "guillermo",
	    "last_name" : "palafox",
	    "user_id" : "5727966450e9446d0e8871b5",
	    "__v" : 0
	};
	var experience = {
			"_id": "571e52a82915bc1e05d40571",
			"updatedAt": "2016-04-25T17:23:52.285Z",
			"createdAt": "2016-04-25T17:23:52.285Z",
			"profile_id": "5710124d2a2823ce06270ad1",
			"type": 1,
			"sector": {
				"id": "571e52a82915bc1e05d40570",
				"name": "Marketing"
			},
			"speciality": {
				"id": "571e52a82915bc1e05d4056f",
				"name": "FullStack Developer"
			},
			"company": {
				"id": "571e52a82915bc1e05d4056c",
				"name": "Axovia"
			},
			"ocupation": {
				"id": "571e52a82915bc1e05d4056d",
				"name": "Web Developer"
			},
			"job": {
				"id": "571e52a82915bc1e05d4056e",
				"name": "Developer"
			},
			"__v": 0
		};
	var skills = [{
			"_id": "5722763de433776d1040497b",
			"updatedAt": "2016-04-28T20:44:45.236Z",
			"createdAt": "2016-04-28T20:44:45.236Z",
			"profile": {
				"id": "5710124d2a2823ce06270ad1"
			},
			"skill": {
				"id": "572253cba8add8ed0e7327d5",
				"name": "PHP"
			},
			"__v": 0
		}];

	var mi = [
		{
			profile: profile1,
			experience: experience,
			skills: skills
		},
		{
			profile: profile1,
			experience: experience,
			skills: skills
		}
	];
	var vecinas = [
		{
			profile: profile2,
			experience: experience,
			skills: skills
		},
		{
			profile: profile2,
			experience: experience,
			skills: skills
		}
	];
	var otros = [
		{
			profile: profile3,
			experience: experience,
			skills: skills
		},
		{
			profile: profile3,
			experience: experience,
			skills: skills
		}
	];

	var data = {mi: mi, vecinas: vecinas, otros: otros};

	func.response(200, data, function(response){
		res.json(response);
	});
});
module.exports = router;