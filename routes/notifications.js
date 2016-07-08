var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var mongoose   = require('mongoose');
var _ = require('underscore');

var func = require('../func'); 
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

var Token       = require('../models/token');
var Profile     = require('../models/profile');
var Review      = require('../models/review');
var User        = require('../models/user');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
var History     = require('../models/history');
var Network     = require('../models/network');
var Feedback    = require('../models/feedback');

var model = require('../model');


router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					Notificationfunc.get({ profile: profileData._id }, function(status, notificationData){
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
router.post('/add', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var type      = req.body.type;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					var data = {};
					switch(type){
						case "0":
							var data = {};
							Notificationfunc.add(0, profileData._id,data, function(status, notificationData){
								res.json(notificationData);
							});
						break;
						case "1":
							var data = {
								profile_emisor: mongoose.Types.ObjectId("577ae1951a03379a3d80197d"),
								profile_mensaje: mongoose.Types.ObjectId("577ae1951a03379a3d80197d"),
								busqueda: mongoose.Types.ObjectId("577c2f388369782f159cfc1d")
							};
							Notificationfunc.add(1, profileData._id,data, function(status, notificationData){
								res.json(notificationData);
							});
						break;
						case "2":
							var data = {
								profile_emisor: mongoose.Types.ObjectId("577ae1951a03379a3d80197d"),
								profile_mensaje: mongoose.Types.ObjectId("577ae1951a03379a3d80197d"),
							};
							Notificationfunc.add(2, profileData._id,data, function(status, notificationData){
								res.json(notificationData);
							});
						break;
						case "3":
							var data = {
								profile_emisor: mongoose.Types.ObjectId("577ae1951a03379a3d80197d")
							};
							Notificationfunc.add(3, profileData._id,data, function(status, notificationData){
								res.json(notificationData);
							});
						break;
						case "4":
							var data = {
								profile_emisor: mongoose.Types.ObjectId("577ae1951a03379a3d80197d")
							};
							Notificationfunc.add(4, profileData._id,data, function(status, notificationData){
								res.json(notificationData);
							});
						break;
					}
				}else{
					res.send("no Profile");
				}
			});
		}else{
			res.send("No Token");
		}
	});
});


module.exports = router;