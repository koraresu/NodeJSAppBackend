var express             = require('express');
var router              = express.Router();
var path                = require('path');
var fs                  = require('fs');
var mongoose            = require('mongoose');
var _                   = require('underscore');
var multipart           = require('connect-multiparty');
var multipartMiddleware = multipart();

var async = require('async');

var ObjectID       = require('mongodb').ObjectID;

var Generalfunc      = require('../functions/generalfunc');
var Profilefunc      = require('../functions/profilefunc');
var Tokenfunc        = require('../functions/tokenfunc');
var Skillfunc        = require('../functions/skillfunc');
var Experiencefunc   = require('../functions/experiencefunc');
var Networkfunc      = require('../functions/networkfunc');
var Notificationfunc = require('../functions/notificationfunc');
var format           = require('../functions/format.js');

var model        = require('../model');
var Profile      = model.profile;
var User         = model.user;
var Token        = model.token;
var Job          = model.job;
var Company      = model.company;
var Experience   = model.experience;
var Network      = model.network;
var History      = model.history;
var Feedback     = model.feedback;
var Review       = model.review;
var Log          = model.log;
var Skill        = model.skill;
var Speciality   = model.speciality;
var Sector       = model.sector;
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
						async.map(notificationData, function(item, ca){
							if(item.deleted == undefined){
								ca(null, item);
							}else{
								if(item.deleted == true){
									ca(null, null);
								}else{
									ca(null, item);
								}
							}
						}, function(err, not){
							not = Generalfunc.cleanArray(not);
							Generalfunc.response(200, not, function(response){
								res.json(response);
							});
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
	
	console.log(accept);

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					if(mongoose.Types.ObjectId.isValid(id)){
						Notification
						.findOne({ _id: id })
						.select('-__v -updatedAt')
						.populate('profile')
						.populate('profile_emisor','_id first_name last_name public_id profile_pic review_score')
						.populate('profile_mensaje','_id first_name last_name public_id profile_pic review_score')
						.populate('network')
						.sort('-_id')
						.exec(function(err,notificationData){
							switch(notificationData.tipo){
								case 3:
									Network.findOne({ _id: notificationData.network }).exec(function(errNetwork, networkData){
										console.log(typeof(accept));
										if(typeof(accept) === "boolean"){
											if(notificationData.clicked == false){
												notificationData.clicked = true;
												notificationData.status = accept;
												notificationData.save(function(err, notification){
													networkData.accepted = accept;
													networkData.save(function(errNet, network){

														Notification.findOne({ network: network._id }).exec(function(errNot, notData){
															if(!errNot && notData){
																notData.status  = true;
																notData.clicked = true;
																notData.save(function(errNotification, notificationData){
																	Generalfunc.response(200, {notification: notification, network: network }, function(response){
																		res.json(response);
																	});
																});
															}else{
																Notificationfunc.add({
																	tipo: 4,
																	profile: notificationData.profile_emisor._id,
																	profile_emisor: notificationData.profile._id,
																	network: network._id,
																	status: true,
																	clicked: true
																},function(errNotification, notificationData){
																	Generalfunc.response(200, {notification: notification, network: network }, function(response){
																		res.json(response);
																	});
																},req);
															}
														});
														
													});
												});
											}else{
												Generalfunc.response(200, {notification: notificationData, network: networkData }, function(response){
													res.json(response);
												});
											}

											
										}else{
											Generalfunc.response(200, {notification: notificationData, network: networkData }, function(response){
												res.json(response);
											});
										}
									});
								break;
								default:
									Generalfunc.response(200, notificationData, function(response){
										res.json(response);
									});
								break;
							}
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
router.post('/delete', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.notification;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					if(mongoose.Types.ObjectId.isValid(id)){
						id = mongoose.Types.ObjectId(id);
						Notification.findOne({ _id: id }).exec(function(err, notificationData){
							if(!err && notificationData){
								notificationData.deleted = true;
								notificationData.save(function(err, not){
									Notification
									.find({ profile: profileData._id })
									.select('-__v -updatedAt')
									.populate('profile')
									.populate('profile_emisor')
									.populate('profile_mensaje')
									.populate('network')
									.sort('-_id')
									.exec(function(err,notificationData){
										async.map(notificationData, function(item, ca){
											if(item.deleted == undefined){
												ca(null, item);
											}else{
												if(item.deleted == true){
													ca(null, null);
												}else{
													ca(null, item);
												}
											}
										}, function(err, not){
											not = Generalfunc.cleanArray(not);
											Generalfunc.response(200, not, function(response){
												res.json(response);
											});
										});
										
									});
								});
							}else{
								Generalfunc.response(200, {}, function(response){
									res.json(response);
								});
							}
						});
					}else{
						Generalfunc.response(200, {}, function(response){
							res.json(response);
						});
					}
				}else{
					Generalfunc.response(200, {}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(200, {}, function(response){
				res.json(response);
			});
		}
	});
});


module.exports = router;