var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var async = require('async');

var faker = require('faker');
faker.locale = "es_MX";
var mongoose    = require('mongoose');
var async = require('async');
var moment = require('moment-timezone');


/*
	Nombre de Modelos:
		Toda las variables de modelo se nombrara, con el nombre del archivo, eliminando _ 
		y cambiando la siguiente letras al _ por mayuscula. Iniciando la primera letra en mayuscula.
		*/
		var Generalfunc      = require('../functions/generalfunc');
		var Profilefunc      = require('../functions/profilefunc');
		var Experiencefunc   = require('../functions/experiencefunc');
		var Tokenfunc        = require('../functions/tokenfunc');
		var Skillfunc        = require('../functions/skillfunc');
		var Networkfunc      = require('../functions/networkfunc');
		var Notificationfunc = require('../functions/notificationfunc');
		var Pushfunc         = require('../functions/pushfunc');
		var APNfunc          = require('../functions/apnfunc');

		var format         = require('../functions/format');

		var model = require('../model');
		var Profile            = model.profile;
		var User               = model.user;
		var Token              = model.token;
		var Job                = model.job;
		var Company            = model.company;
		var Experience         = model.experience;
		var Network            = model.network;
		var History            = model.history;
		var Feedback           = model.feedback;
		var Review             = model.review;
		var Log                = model.log;
		var Skill              = model.skill;
		var Speciality         = model.speciality;
		var Sector             = model.sector;
		var Notification       = model.notification;
		var Feedback           = model.feedback;
		var Conversation       = model.conversation;
		var ConversationStatus = model.conversationstatus;
		var Online             = model.online;
		var Device             = model.device;
		var Push               = model.push;
		var PushEvent          = model.pushevent;
		var Message            = model.message;
		var City               = model.city;
		var State              = model.state;
		var Country            = model.country;

		var apnProvider = Generalfunc.apnProvider();
		function readed_conv(profile_id, conversation, success, fail){
			PushEvent.find({ profile: profile_id, read: false, type: 0 }).populate('message').exec(function(pushErr, pushEventData){
				async.map(pushEventData, function(item, ca){
					
					
					
					if(item.message.conversation.toString() == conversation.toString()){
						ca(null, item);
					}else{
						ca(null, null);
					}
				}, function(err, results){
					results = Generalfunc.cleanArray( results );
					success(results);
				});
				
			});
		};
		function conversation_format(profile_id, success, fail){
			Conversation.find({
				profiles:{
					$in: [ profile_id ]
				}
			})
			.populate('profiles')
			.populate('message')
			.sort({ updatedAt: -1 })
			.exec(function(err, conversationData){
				if(!err && conversationData){
					async.map(conversationData, function(item, ca){
						if(item.profiles.length > 1){
							var equal = profile_equal(profile_id, item.profiles);
							var ajeno = profile_ajeno(profile_id, item.profiles);
							var number = equal.number;

							if(item.prop_status != undefined){
								if(item.prop_status[number] == 1){
									ajeno = ajeno.profile;
									var aj = {
										name: ajeno.first_name + " " + ajeno.last_name,
										profile_pic: ajeno.profile_pic
									};

									var last_message = "";
									var t = 0;
									if(item.message != undefined){
										console.log( item );
										t = item.message.type;
										if(t == 1){
											last_message = "🏙";
										}else{
											last_message = item.message.message;	
										}							
									}
									readed_conv(profile_id, item._id, function(num){
										if(num.length > 0){
											num = true;
										}else{
											num = false;
										}
										var d = {
											_id: item._id,
											last_message: last_message,
											profile: aj,
											status: item.prop_status[number],
											readed: num,
											date: item.updatedAt,
											type: t
										};
										ca(null, d);
									}, function(){
										var d = {
											_id: item._id,
											last_message: last_message,
											profile: aj,
											status: item.prop_status[number],
											readed: false,
											date: item.updatedAt
										};
										ca(null, d);
									});
								}else{
									ca(null, null);
								}
							}else{
								ca(null, null);
							}

						}else{
							ca(null, null);
						}
					}, function(err, results){
						results = Generalfunc.cleanArray(results);
						success(results);
					});
				}else{
					Generalfunc.response(101, {}, function(response){
						fail(response);
					});
				}
			});
		};
		router.post('/conversations', multipartMiddleware, function(req, res){
			var guid      = req.body.guid;

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){

							conversation_format(profileData._id, function(results){
								res.json(results);
							}, function(response){
								res.json(response);
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
		router.post('/conversation', multipartMiddleware, function(req, res){
			var guid      = req.body.guid;
			var id        = req.body.id;

			var page      = req.body.page;

			var limit = 10;


			if(page == undefined){
				page = 1;
			}


			page = page-1;
			offset = page*limit;

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							if(mongoose.Types.ObjectId.isValid(id)){
								id = mongoose.Types.ObjectId(id);

								setActive(id, profileData._id, function(){
									Message.find({
										conversation: id,
										status: true
									}).populate('profile_id').sort({ createdAt: -1 }).limit(limit).skip(offset).exec(function(err, messageData){
										async.map(messageData, function(item, callback){
											var d = (item.profile_id._id.toString() == profileData._id.toString());
											var udate = moment(item.updatedAt);
											var cdate = moment(item.createdAt);
											
											var m = ( item.type == 1)?"http://thehiveapp.mx:3000/messages/" + item.message:item.message;

											var i = {
												_id: item._id,
												updatedAt: udate.tz("America/Mexico_City").format(),
												createdAt: cdate.tz("America/Mexico_City").format(),
												conversation: item.conversation,
												profile_id: item.profile_id,
												message: m,
												type: item.type
											};
											
											callback( null, { data: i, t: d});
										}, function(err, results){
											Conversation.findOne({
												_id: id
											}).populate('profiles').exec(function(errConversation, conversationData){

												var x = Generalfunc.profile_ajeno(profileData._id, conversationData.profiles);
												var title = x.first_name + " " + x.last_name;
												Generalfunc.NoReaded( profileData._id.toString() , function(num){
													console.log("No ReadedNum", num);
													console.log("Profile", profileData._id);

													APNfunc.sendNum(profileData._id, num,"",function(){
														Generalfunc.response(200, { title: title, avatar: x.profile_pic, conversation: conversationData, messages: results}, function(response){
															res.json(response);
														});
													});	
												}, function(){
													console.log("No Readed");
													Generalfunc.response(200, { title: title, avatar: x.profile_pic, conversation: conversationData, messages: results}, function(response){
														res.json(response);
													});
												});
											});
											
										})
									});
								});
							}else{
								Generalfunc.response(101, {}, function(response){
									res.json( response );
								});
							}
							
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
		});
		router.post('/delete/conversation', multipartMiddleware, function(req, res){
			var guid             = req.body.guid;
			var conversation_id  = req.body.conversation_id;
			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							if(mongoose.Types.ObjectId.isValid(conversation_id)){
								conversation_id = mongoose.Types.ObjectId(conversation_id);

								Conversation.findOne({ _id: conversation_id }).populate('profiles').exec(function(errConv, conversationData){
									

									var equal = profile_equal(profileData._id, conversationData.profiles);
									var n = equal.number;
									
									
									var a = [ 0, 0 ];
									a[0] = conversationData.prop_status[0];
									a[1] = conversationData.prop_status[1];
									a[n] = 0;

									conversationData.prop_status = a;
									Message.update({
										conversation: conversationData._id
									}, {
										$set: {
											status: false
										}
									},{
										multi: true
									}, function(){
										conversationData.save(function(err, conversation){
											if(!err && conversation){
												conversation_format(profileData._id, function(results){
													res.json(results);
												}, function(response){
													res.json(response);
												});
											}else{
												Generalfunc.response(101, {}, function(response){
													res.json( response );
												});
											}
										});
									});
								});
							}else{
								Generalfunc.response(101, {}, function(response){
									res.json( response );
								});
							}
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
		});
		router.post('/new/conversation', multipartMiddleware, function(req, res){
			var guid       = req.body.guid;
			var public_id  = req.body.public_id;

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							if(mongoose.Types.ObjectId.isValid(public_id)){
								public_id = mongoose.Types.ObjectId(public_id);
								Networkfunc.PublicId(public_id, function(statusPublic, profileAnotherData){

									if(statusPublic){
										var find = {
											"profiles": {
												"$all": [profileData._id,profileAnotherData._id],
											}
										};

										Conversation.findOne(find).populate('profiles').exec(function(errConversation, conversationData){
											if(!errConversation && conversationData){
												Generalfunc.response(200, conversationData, function(response){
													res.json(response);
												});
											}else{
												var conversation = new Conversation({
													profiles: [
													profileData._id,
													profileAnotherData._id
													],
													prop_status: [1,1],
													readed: [true,true],
													message: null
												});
												conversation.save(function(errConversation, conversationData){
													Conversation.findOne({ _id: conversationData._id }).populate('profiles').exec(function(errConversation, conversationData){
														Generalfunc.response(200, conversationData, function(response){
															res.json(response);
														});
													});
												});
											}
										});

									}else{
										Generalfunc.response(101,{}, function(response){
											res.json(response);
										});
									}
								});
							}else{

							}
						}else{

						}
					});
				}else{

				}
			});
		});
		router.conversationsJoin = function(socket, callback){
			var guid = socket.guid;
			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							Conversation.find({
								profiles:{
									$in: [ profileData._id ]
								}
							}).populate('profiles').populate('message').exec(function(errJoin, joinData){
								joinData.forEach(function(value, index){
									socket.join(value._id.toString());
									if((joinData.length-1) == index){
										callback(true, joinData);
									}
								});
							});
						}else{
							callback(false, {});
						}
					});
				}else{
					callback(false, {});
				}
			});
		};
		router.setOnline = function(guid,socket, callback){

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							var d = {
								profiles: profileData._id,
								socket: socket.toString()
							};

							var online = new Online(d);
							online.save(function(err, onlineData){
								callback(true, socket, profileData );
							});
						}else{
							callback(false, socket);
						}
					});
				}else{
					callback(false, socket);
				}
			});
		};
		router.toProfile = function(socket, callback){
			Online.findOne({
				socket: socket
			}).exec(function(err, online){
				callback( online );
			});
		};
		router.setDevice = function(guid, deviceID, callback){

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){

							Device.find({ profile: profileData._id, token: deviceID }).exec(function(errDevice, deviceData){
								if(!errDevice && deviceData){
									if(deviceData.length > 0){
										Device.find({ profile: profileData._id }).exec(function(errDevice, deviceData){
											async.map(deviceData, function(item, ca){
												ca(null, item.token);
											}, function(err, results){
												callback(true, results, profileData );	
											});
										});
									}else{
										var d = {
											profile: profileData._id,
											token:   deviceID,
											active: true
										}

										var deviceEl = new Device(d);
										deviceEl.save(function(err, deviceData){
											Device.find({ profile: profileData._id }).exec(function(errDevice, deviceData){
												async.map(deviceData, function(item, ca){
													ca(null, item.token);
												}, function(err, results){
													callback(true, results, profileData );	
												});
											});
										});
									}
									
								}else{
									callback(false, deviceID);
								}
							});
						}else{
							callback(false, deviceID);
						}
					});
				}else{
					callback(false, deviceID);
				}
			});
		};
		router.unsetOnline = function(socket, callback){
			Online.remove({ socket: socket.id }).exec(function(err){
				callback(err, socket);
			});
		};
		router.setReadedMessage = function(data, success, fail){
			
			var guid = data.guid;

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							Conversation
							.findOne({
								_id: data.conversation,
								profiles: {
									$in: [profileData._id]
								}
							})
							.populate('profiles')
							.exec(function(errConversation, conversationData){
								
								if(!errConversation && conversationData){
									
									var equal = Generalfunc.profile_equal(profileData._id, conversationData.profiles);
									var readed = conversationData.readed;
									var r = [false, false];
									r[0] = readed[0];
									r[1] = readed[1];
									r[equal.number] = true;
									conversationData.readed = r;
									
									

									conversationData.save(function(err, conv){
										var a = function(ca){
											Conversation
											.findOne({
												_id: data.conversation
											}).exec(ca);
										}
										Pushfunc.eventsetReaded({
											type:0,
											conversation: conversationData
										}, function(pushevent){
											a(function(errConversation, conversationData){
												
												if(!errConversation && conversationData){
													success(conversationData);
												}else{
													fail(4);
												}
											});
										}, function(err){
											fail(3);
										})

										
									});
								}else{
									fail(2);
								}
							});
						}else{
							fail(1);
						}
					});
				}else{
					fail(0);
				}
			});
		};
		router.message = function(data, callback){
			

			var guid      = data.guid;
			var id        = data.conversation
			var text      = data.message;
			var type      = data.type;
			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							if(mongoose.Types.ObjectId.isValid(id)){
								id = mongoose.Types.ObjectId(id);
								if(type == 1){
									var name = mongoose.Types.ObjectId();
									var path = __dirname + "/../public/messages/" + name + ".png";
									decodeBase64Image(data.image, path);
									text = name+'.png';
								}
								var d = {
									type: type,
									conversation: id,
									profile_id: profileData._id,
									message: text,
									status: true
								};
								
								var message = new Message(d);
								message.save(function(err, mData){

									Message.findOne({ _id: mData._id}).populate('profile_id').exec(function(err, messageData){
										Conversation.findOne({ _id: id }).populate('profiles').exec(function(errConv, convData){
											if(!errConv && convData){
												var equal                 = Generalfunc.profile_equal(profileData._id, convData.profiles);
												var readed                = convData.readed;
												var prop_status           = convData.prop_status;

												readed[equal.number]      = false;
												prop_status[equal.number] = 1;
												convData.message          = messageData._id;
												convData.readed           = readed;
												convData.prop_status      = prop_status;

												convData.save(function(errCon, conData){
													callback(true, messageData);
												});	
											}else{
												callback(true, messageData);	
											}
										});
									});
								});
							}else{
								callback(false, null);
							}
							
						}else{
							callback(false, null);
						}
					});
				}else{
					callback(false, null);
				}
			});
		};
		router.delete = function(socket, callback){
			Online.remove({ socket: socket }).exec(function(err){
				callback(err, socket);
			});
		};
		router.clean = function(callback){
			Online.remove({}).exec(function(err){
				callback(err);
			});
		};
		router.sendPush = function(deviceToken, message, name, conversation, callback){
			var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = 0;
	note.sound = "ping.aiff";
	note.alert = message;
	note.payload = {'messageFrom': name, 'conversation': conversation };
	note.topic = "com.thehiveapp.thehive";
	apnProvider.send(note, deviceToken).then( (result) => {
		if(result.failed[0] != undefined){
			if(result.failed[0].error != undefined){
				
			}
		}
		callback(result);
	});
};
router.accept_notification = function(data, callback){
	var id = data.id;
	var guid = data.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			//
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					//
					if(mongoose.Types.ObjectId.isValid(id)){
						//
						id = mongoose.Types.ObjectId(id);
						Notification.findOne({ _id: id }).populate('network').exec(function(err,notificationData){
							if(!err && notificationData){
								//
								//
								Network.findOne({ _id: notificationData.network._id }).populate('profiles').exec(function(errNetwork, networkData){
									
									if(!errNetwork && networkData){
										
										networkData.accept = true;
										networkData.save(function(){
											notificationData.clicked = true;
											notificationData.status  = true;
											notificationData.save(function(err, n){
												Notification.findOne({ _id: id }).populate('network').exec(function(err,notificationData){
													
													
													var ajeno = profile_ajeno(profileData._id, networkData.profiles);
													
													Online.findOne({
														profiles: ajeno.profile._id
													}).sort({created_at: -1}).exec(function(errOnline, onlineData){
														
														console.log(onlineData)
														Notification
														.findOne({ _id: notificationData._id })
														.select('-__v -updatedAt')
														.populate('profile')
														.populate('profile_emisor')
														.populate('profile_mensaje')
														.populate('network')
														.exec(function(err,notificationData){
															callback(true, onlineData, networkData, notificationData);	
														});
													});
												});
											});
										});
									}else{
										
										
										callback(false, {}, {}, {});
									}
								});
							}
						});
					}else{
						
						callback(false, {}, {}, {});
					}
				}else{
					
					callback(false, {}, {}, {});
				}
			});
		}else{
			
			callback(false, {}, {}, {});
		}
	});
};
router.notification_accept2C = function(data, success, fail){
	var id = data.id;
	var guid = data.guid;
	var stat = data.accept;

	
	
	

	Tokenfunc.exist2Callback(guid, function(tokenData){
		Profilefunc.tokenToProfile2Callback(tokenData.generated_id, function(profileData){
			Generalfunc.isValid(id, function(id){
				Notificationfunc.getOne2Callback({ _id: id }, function(notificationData){
					var bool_Network = function(networkData){
						
						Notificationfunc.click({ _id: id },stat, function(notificationData){
							
							var ajeno = profile_ajeno(profileData._id, networkData.profiles);


							var a = function(ajeno, notificationData, networkData,c){
								Online.findOne({
									profiles: ajeno.profile._id
								}).sort({created_at: -1}).exec(function(errOnline, onlineData){
									Notification
									.findOne({ _id: notificationData._id })
									.select('-__v -updatedAt')
									.populate('profile')
									.populate('profile_emisor')
									.populate('profile_mensaje')
									.populate('network')
									.exec(function(err,notificationData){
										c(onlineData, networkData, notificationData);	
									});
								});
							};

							if(stat){
								Notificationfunc.addOrGet({
									tipo: 4,
									profile: notificationData.profile_emisor,
									profile_emisor: notificationData.profile,
									network: networkData._id,
								},{
									tipo: 4,
									profile: notificationData.profile_emisor,
									profile_emisor: notificationData.profile,
									network: networkData._id,
									status: true,
									clicked: true
								}, function(status, newNotData){
									Notificationfunc.getOne2Callback({ _id: newNotData._id }, function(notNewData){
										a(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
											success(onlineData, networkData, notNData, notificationData);
										});
									}, function(st){
										fail( st );
									});
								});
							}else{
								Notificationfunc.getOne2Callback({ _id: notificationData._id }, function(notNewData){
									a(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
										success(onlineData, networkData, notNData, notificationData);
									});
								}, function(st){
									fail( st );
								});
							}
						}, function(st){
							fail( st );
    					});// Notification Click
					};

					var bool_uno_Network = function(networkData){
						
						Notificationfunc.click({ _id: id },stat, function(notificationData){
							
							var ajeno = profile_ajeno(profileData._id, networkData.profiles);


							var a = function(ajeno, notificationData, networkData,c){
								Online.findOne({
									profiles: ajeno.profile._id
								}).sort({created_at: -1}).exec(function(errOnline, onlineData){
									Notification
									.findOne({ _id: notificationData._id })
									.select('-__v -updatedAt')
									.populate('profile')
									.populate('profile_emisor')
									.populate('profile_mensaje')
									.populate('network')
									.exec(function(err,notificationData){
										c(onlineData, networkData, notificationData);	
									});
								});
							};

							var search = {};
							var insert = {};
							if(notificationData.tipo == 1){
								search = {
									tipo: 3,
									profile: notificationData.profile_mensaje,
									profile_emisor: notificationData.profile,
									network: networkData._id,
									status: false,
									clicked: false
								};
								insert = {
									tipo: 3,
									profile: notificationData.profile_emisor,
									profile_emisor: notificationData.profile,
									network: networkData._id,
									status: false,
									clicked: false
								};
							}else{
								search = {
									tipo: 3,
									profile: notificationData.profile_emisor,
									profile_emisor: notificationData.profile,
									network: networkData._id,
									status: false,
									clicked: false
								};
								insert = {
									tipo: 3,
									profile: notificationData.profile_emisor,
									profile_emisor: notificationData.profile,
									network: networkData._id,
									status: false,
									clicked: false
								};
							}
							Notificationfunc.addOrGet(search, insert, function(status, newNotData){
								Notificationfunc.getOne2Callback({ _id: newNotData._id }, function(notNewData){
									a(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
										success(onlineData, networkData, notNData, notificationData);
									});
								}, function(st){
									fail(6);
								});
							});
						}, function(st){
							fail(5);
    					});// Notification Click
					}

					if(notificationData.tipo == 1){
						
						
						
						Networkfunc.new_friend(notificationData.profile_emisor, notificationData.profile_mensaje, function(networkData){
							Network.findOne({ _id: networkData._id}).populate('profiles').exec(function(errNetwork, networkData){
								bool_uno_Network(networkData);
							});
						}, function(st){
							fail(4+"!"+st);
    						});// Network New Friend
						
					}else if(notificationData.tipo == 3){
						
						

						if(stat == true){
							Networkfunc.accept({ _id: notificationData.network }, bool_Network, function(st){
								fail(4+"!"+st);
	    					});//Network Accept	
						}else{
							Networkfunc.ignore({ _id: notificationData.network }, bool_Network, function(st){
								fail(4+"!"+st);
	    					});//Network Ignore	
						}
					}
				}, function(st){
					fail(3);
    			});//Notification get One 2 Callback
}, function(st){
	fail(2);
    		});// Is Valid
}, function(st){
	fail(1);
    	});// Profile token to profile 2 Callback
}, function(st){
	fail(0);
    });// Token exist 2 callback
};
router.deviceajeno = function(conversation, socket, callback){
	Conversation.findOne({ _id: mongoose.Types.ObjectId(conversation) }).exec(function(errConversation, conversationData){
		var profiles = conversationData.profiles;

		Online.findOne({ socket: socket }).exec(function(errOnline, onlineData){
			if(!errOnline && onlineData){
				var first  = profiles[0];
				var second = profiles[1];
				var t      = (onlineData.profiles.toString() == first.toString()) ? second : first ;
				
				

				Device.find({
					profile: t
				}).exec(function(errDevice, deviceData){
					if(!errDevice && deviceData){
						async.map(deviceData, function(item, ca){
							ca(null, item.token);
						}, function(err, results){
							callback(true, results);
						});
					}else{
						callback(false,{});
					}
				});
			}else{
				callback(false,{});
			}
		});
	});
};
router.apple_push = function(type, id, socket, success, fail){
	if(type == 1){
		
		Conversation.findOne({ _id: mongoose.Types.ObjectId(id) }).populate('profiles').exec(function(errConversation, conversationData){
			
			if(!errConversation && conversationData){
				Online.findOne({ socket: socket.id }).populate('profiles').exec(function(errOnline, onlineData){
					if(!errOnline && onlineData){
						var profiles = conversationData.profiles;
						var profile = onlineData.profiles;
						var ajeno = profile_ajeno(profile._id, profiles);
						success(ajeno);
					}else{
						fail(1);
					}
				});
			}else{
				fail(0);
			}				
		});	
	}else if(type == 0){
		
		Notification.findOne({ _id: mongoose.Types.ObjectId(id) })
		.populate('profile')
		.populate('profile_emisor')
		.populate('network')
		.exec(function(err, notificationData){
			
			if(!err && notificationData){
				Online.findOne({ socket: socket.id }).populate('profiles').exec(function(errOnline, onlineData){
					if(!errOnline && onlineData){
						success( notificationData.profile_emisor );
					}else{
						fail(1);
					}
				});
			}else{
				fail(0);
			}
		});
	}	
};

router.mensaje_create = function(data, nombre_emisor, nombre_mensaje){
	switch(data.tipo){
		case 0: //0 = se ha unido
		message = "¡Tu contacto " + nombre_emisor + " se ha unido! ";
		clase = "unio";
		break;
		case 1: //1 = recomendación
		message = nombre_emisor + " te recomienda a " + nombre_mensaje;
		clase = "recomendacion";
		break;
		case 2: //2 = share contacto
		message = nombre_emisor + " quiere enviar tu contacto a "+nombre_mensaje;
		clase = "share";
		break;
		case 3: //3 = Envio Solucitud
		if(data.clicked == 1){
			if(data.status == 1){
				message = "Tu y " + nombre_emisor + " están conectados";
				clase = "accept";
			}else{
				message = "No aceptaste la solicitud de " + nombre_emisor;
				clase = "accept";
			}
		}else{
			message = nombre_emisor + " te quiere contactar";
			clase = "connect";
		}
		break;
		case 4: //4 = Respondio Solicitud
		message = nombre_emisor + " te añadió";
		clase = "accept";
		break;
		default:
		message = "";
		clase = "";
		break;
	}
	return { mensaje: message, class: clase };
};
function setActive(conversation, profileID, success){
	
	
	Conversation.findOne({ _id: conversation }).populate('profiles').exec(function(errConv, convData){
		
		
		var prop = convData.prop_status;
		var equal = profile_equal(profileID, convData.profiles);
		
		prop[equal.number] = 1;

		convData.update({ $set: { prop_status: prop } }, { upsert: false }, function(err, conv){
			Conversation.findOne({ _id: conversation }).populate('profiles').exec(function(errConv, convData){
				setReadMessage(convData._id, function(messData){
					success(errConv, convData);
				});
			});
		});
	});
};
function setReadMessage(conversation, success){
	Message.find({
		conversation: conversation
	}).distinct("_id",function(err, messData){
		PushEvent.update({
			message: {
				$in: messData
			}
		},{
			$set: {
				read: true
			}
		}, { multi: true }, function(err, pushUpdate){
			success( messData);
		});
	});
}
router.setReadMessage = setReadMessage;
router.setActive     = setActive;
router.sendPushtoAll = Generalfunc.sendPushtoAll;
router.sendPushOne   = Generalfunc.sendPushOne;
router.profile_equal = profile_equal
module.exports = router;
function profile_ajeno(profileID, profiles){
	var first  = profiles[0];
	var second = profiles[1];

	var element;
	var number = -1;
	if(first._id.toString() == profileID.toString()){
		element = second;
		number = 1;
	}else{
		element = first;
		number = 0;
	}
	return { number: number, profile: element };
}
function profile_equal(profileID, profiles){
	var first  = profiles[0];
	var second = profiles[1];

	var element;
	var number = -1;
	if(first._id.toString() == profileID.toString()){
		element = first;
		number = 0;
	}else{
		element = second;
		number = 1;
	}
	return { number: number, profile: element };
}
function decodeBase64Image(image, path) {
	var fs = require("fs");
	var bitmap = new Buffer(image, 'base64');
	fs.writeFileSync(path, bitmap);
}
