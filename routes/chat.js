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
var apn = require('apn');

options = {
	keyFile : "conf/key.pem",
	certFile : "conf/cert.pem",
	debug : true
};
var options = {
	token: {
		key: "conf/key.p8",
		keyId: "822637C6D9",
		teamId: "58GA47LFA6",
	},
	cert: "conf/cert.pem",
	production: true,
};
var apnProvider = new apn.Provider(options);

/*
	Nombre de Modelos:
		Toda las variables de modelo se nombrara, con el nombre del archivo, eliminando _ 
		y cambiando la siguiente letras al _ por mayuscula. Iniciando la primera letra en mayuscula.
		*/
		var Generalfunc    = require('../functions/generalfunc');
		var Profilefunc    = require('../functions/profilefunc');
		var Experiencefunc = require('../functions/experiencefunc');
		var Tokenfunc      = require('../functions/tokenfunc');
		var Skillfunc      = require('../functions/skillfunc');
		var Networkfunc    = require('../functions/networkfunc');

		var format         = require('../functions/format');

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
		var Online       = model.online;
		var Device       = model.device;
		var Message      = model.message;
		var City         = model.city;
		var State        = model.state;
		var Country      = model.country;


		router.post('/conversations', multipartMiddleware, function(req, res){
			var guid      = req.body.guid;

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							Conversation.find({
								profiles:{
									$in: [ profileData._id ]
								}
							}).populate('profiles').populate('message').sort({ updatedAt: -1 }).exec(function(err, conversationData){
								if(!err && conversationData){
									console.log("Conversation Data:");
									console.log( conversationData );
									async.map(conversationData, function(item, ca){
										console.log("Conversation:");
										console.log(item);
										if(item.profiles.length > 1){
											var ajeno = profile_ajeno(profileData._id, item.profiles);
											var number = ajeno.number;
											console.log("Profile Status:");
											console.log( item.prop_status );
											if(item.prop_status != undefined){
												if(item.prop_status[number] != undefined){
													if(item.prop_status[number] == 1){
														ajeno = ajeno.profile;
														//var ajeno = Generalfunc.profile_ajeno(profileData._id, item.profiles);
														var aj = {
															name: ajeno.first_name + " " + ajeno.last_name,
															profile_pic: ajeno.profile_pic
														};

														var m = "";
														if(item.message != undefined){
															m = item.message.message;	
														}
														
														var d = {
															_id: item._id,
															last_message: m,
															profile: aj,
															status: item.prop_status[number],
															date: item.updatedAt
														};
														ca(null, d);
													}else{
														ca("Inactive", null);
													}
												}else{
													ca("Inactive", null);
												}
											}else{
												ca("Inactive", null);
											}
										}else{
											ca("solo un perfil", null);
										}
									}, function(err, results){
										console.log( err );
										res.json(results);
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
								Message.find({
									conversation: id
								}).populate('profile_id').sort({$natural:-1}).limit(limit).skip(offset).exec(function(err, messageData){
									async.map(messageData, function(item, callback){
										var d = (item.profile_id._id.toString() == profileData._id.toString());
										callback( null, { data: item, t: d});
									}, function(err, results){
										Conversation.findOne({
											_id: id
										}).populate('profiles').exec(function(errConversation, conversationData){

											var x = Generalfunc.profile_ajeno(profileData._id, conversationData.profiles);
											var title = x.first_name + " " + x.last_name;

											Generalfunc.response(200, { title: title,conversation: conversationData, messages: results}, function(response){
												res.json(response);
											});
										});
										
									})
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
		router.post('/delete/conversation', multipartMiddleware, function(req, res){
			var guid             = req.body.guid;
			var conversation_id  = req.body.conversation_id;
			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							if(mongoose.Types.ObjectId.isValid(conversation_id)){
								conversation_id = mongoose.Types.ObjectId(conversation_id);


							}else{

							}
						}else{

						}
					});
				}else{

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
													prop_status: [1,1]
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
		}
		router.setOnline = function(guid,socket, callback){
			console.log(" SET ONLINE ");
			console.log("GUID:" + guid );

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							var d = {
								profiles: profileData._id,
								socket: socket.toString()
							};
							console.log("D:");
							console.log(d);
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
		}
		router.setDevice = function(guid, deviceID, callback){
			console.log(" SET DEVICE ");
			console.log("GUID:" + guid );
			console.log("TOKEN:" + deviceID );
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
										console.log("D:");
										console.log(d);
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
		}
		router.unsetOnline = function(socket, callback){
			Online.remove({ socket: socket.id }).exec(function(err){
				callback(err, socket);
			});
		}
		router.message = function(data, callback){
			console.log(data);

			var guid      = data.guid;
			var id        = data.conversation
			var text      = data.message;

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						if(status){
							if(mongoose.Types.ObjectId.isValid(id)){
								id = mongoose.Types.ObjectId(id);
								var d = {
									conversation: id,
									profile_id: profileData._id,
									message: text
								};
								var message = new Message(d);
								message.save(function(err, mData){

									Message.findOne({ _id: mData._id}).populate('profile_id').exec(function(err, messageData){
										Conversation.findOne({ _id: id }).exec(function(errConv, convData){
											if(!errConv && convData){
												convData.message = messageData._id;
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


		}
		router.delete = function(socket, callback){
			Online.remove({ socket: socket }).exec(function(err){
				callback(err, socket);
			});
		}
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
  			console.log( result.failed[0].error );
  		}
  	}
  	callback(result);
  });
}
router.accept_notification = function(data, callback){
	var id = data.id;
    var guid = data.guid;

    console.log("ID: "+id);
    console.log("GUID: "+guid);

    Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			console.log(" Token OK ");
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					console.log("Profile Token OK");
					if(mongoose.Types.ObjectId.isValid(id)){
						console.log("ID is Valid");
						id = mongoose.Types.ObjectId(id);
						Notification.findOne({ _id: id }).exec(function(err,notificationData){
							if(!err && notificationData){
								console.log(" Notification OK");
								Network.findOne({ network: notificationData.network }).populate('profiles').exec(function(errNetwork, networkData){
									if(!errNetwork && networkData){
										console.log("Network OK");
										networkData.accept = true;
										networkData.save(function(){
											console.log("Ajeno:");
											console.log(network.profiles);
											var ajeno = profile_ajeno(profileData._id, networkData.profiles);
											console.log( ajeno );
											Online.findOne({
												profiles: ajeno._id
											}).exec(function(errOnline, onlineData){
												console.log(errOnline);
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
										

									}else{
										console.log("Network Not OK");
										callback(false, {}, {}, {});
									}
								});
							}
						});
					}else{
						console.log("ID inValid");
						callback(false, {}, {}, {});
					}
				}else{
					console.log("Profile Token Not OK");
					callback(false, {}, {}, {});
				}
			});
		}else{
			console.log(" Token Not OK");
			callback(false, {}, {}, {});
		}
	});
}
router.deviceajeno = function(conversation, socket, callback){

	console.log("/******* Chat Apple Push Notification *****/");
	console.log("Socket:"+socket);
	console.log("Conversation:" + conversation );

	Conversation.findOne({ _id: mongoose.Types.ObjectId(conversation) }).exec(function(errConversation, conversationData){
		var profiles = conversationData.profiles;

		Online.findOne({ socket: socket }).exec(function(errOnline, onlineData){
			if(!errOnline && onlineData){
				console.log( "OnlineData:" );
				console.log( onlineData );
				console.log( "OnlineData Profiles:");
				console.log( onlineData.profiles );
				console.log("Tamaño:");
				console.log(profiles.length);

				var first  = profiles[0];
				var second = profiles[1];

				console.log("F:"+first.toString());
				console.log("S:"+second.toString());

				var t = "";

				if(onlineData.profiles.toString() == first.toString()){
					t = second;
				}else{
					t = first;
				}
				
				console.log("Tercero:" + t );

				Device.find({ profile: t }).exec(function(errDevice, deviceData){
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
}
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