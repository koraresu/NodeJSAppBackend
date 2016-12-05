var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var mongoose   = require('mongoose');
var _ = require('underscore');


var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var ObjectID = require('mongodb').ObjectID;

var Generalfunc    = require('../functions/generalfunc');
var Profilefunc    = require('../functions/profilefunc');
var Tokenfunc      = require('../functions/tokenfunc');
var Skillfunc      = require('../functions/skillfunc');
var Experiencefunc = require('../functions/experiencefunc');
var Networkfunc    = require('../functions/networkfunc');
var Notificationfunc = require('../functions/notificationfunc');
var format         = require('../functions/format.js');

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

router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					Notification
					.find({ profile: profileData._id })
					.select('-__v -updatedAt')
					.populate('profile')
					.populate('profile_emisor')
					.populate('profile_mensaje')
					.populate('network')
					.sort('-_id')
					.exec(function(err,notificationData){
						Generalfunc.response(200, notificationData, function(response){
							res.json(response);
						});
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
router.post('/accept', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.id;
	var accept    = req.body.accept;

	accept = (accept === "true");
	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					if(mongoose.Types.ObjectId.isValid(id)){
						Notification
						.findOne({ _id: id })
						.select('-__v -updatedAt')
						//.populate('profile')
						//.populate('profile_emisor')
						//.populate('profile_mensaje')
						.populate('network')
						.sort('-_id')
						.exec(function(err,notificationData){
							Network.findOne({ _id: notificationData.network }).exec(function(errNetwork, networkData){
								if(typeof(accept) === "boolean"){
									networkData.clicked = true;
									networkData.status = accept;
									networkData.save(function(err, network){
										Generalfunc.response(200, {notification: notificationData, network: networkData }, function(response){
											res.json(response);
										});
									});
								}else{
									Generalfunc.response(200, {notification: notificationData, network: networkData }, function(response){
										res.json(response);
									});
								}
							});
							/*
							
							*/
						});
					}else{
						Generalfunc.response(101, {}, function(response){
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


module.exports = router;