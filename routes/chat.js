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
		var Message            = model.message;
		var City               = model.city;
		var State              = model.state;
		var Country            = model.country;

		var apnProvider = Generalfunc.apnProvider();

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
											
											var equal = profile_equal(profileData._id, item.profiles);
											var ajeno = profile_ajeno(profileData._id, item.profiles);

											var number = equal.number;
											console.log("Profile Status:");
											console.log( item.prop_status );

											if(item.prop_status != undefined){
												if(item.prop_status[number] != undefined){
													if(item.prop_status[number] == 1){
														ajeno = ajeno.profile;
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
										if(results == null){
											res.json( [] );
										}else{
											res.json(results);	
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
										var udate = moment(item.updatedAt);
										var cdate = moment(item.createdAt);
										
										var i = {
											_id: item._id,
   											updatedAt: udate.tz("America/Mexico_City").format(),
											createdAt: cdate.tz("America/Mexico_City").format(),
											conversation: item.conversation,
											profile_id: item.profile_id,
											message: item.message
										};
										
										callback( null, { data: i, t: d});
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

								Conversation.findOne({ _id: conversation_id }).populate('profiles').exec(function(errConv, conversationData){
									console.log("ConversationData:");

									var equal = profile_equal(profileData._id, conversationData.profiles);
									var n = equal.number;
									console.log("N:");
									console.log( n );
									var a = [ 0, 0 ];
									a[0] = conversationData.prop_status[0];
									a[1] = conversationData.prop_status[1];
									a[n] = 0;

									conversationData.prop_status = a;

									conversationData.save(function(err, conversation){
										if(!err && conversation){
											Conversation.findOne({ _id: conversation_id }).exec(function(errConv, conv){
												console.log( conv );
												Generalfunc.response(200, conv, function(response){
													res.json( response );
												});
											});
										}else{
											Generalfunc.response(101, {}, function(response){
												res.json( response );
											});
										}
										
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
													readed: [true,true]
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
							.exec(function(errConversation, conversationData){
								if(!errConversation && conversationData){
									var equal = Generalfunc.profile_equal(profileData._id, conversationData.profiles);
									var readed = conversationData.readed;
									readed[equal.number] = true;
									conversationData.readed = readed;
									conversationData.save(function(err, conv){
										Conversation
										.findOne({
											_id: data.conversation
										}).exec(function(errConversation, conversationData){
											if(!errConversation && conversationData){
												success(conversationData);
											}else{
												fail();
											}
										});
										
									});
								}else{
									fail();
								}
							});
						}else{
							fail();
						}
					});
				}else{
					fail();
				}
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
										Conversation.findOne({ _id: id }).populate('profiles').exec(function(errConv, convData){
											console.log("Error Conversation:");
											console.log( errConv );
											console.log("Conv Data:");
											console.log(convData);
											if(!errConv && convData){
												var equal = Generalfunc.profile_equal(profileData._id, convData.profiles);
												var readed = convData.readed;
												readed[equal.number] = false;
												convData.message = messageData._id;

												convData.readed = readed;
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
		router.clean = function(callback){
			Online.remove({}).exec(function(err){
				callback(err);
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
    Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			//console.log(" Token OK ");
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					//console.log("Profile Token OK");
					if(mongoose.Types.ObjectId.isValid(id)){
						//console.log("ID is Valid");
						id = mongoose.Types.ObjectId(id);
						Notification.findOne({ _id: id }).populate('network').exec(function(err,notificationData){
							if(!err && notificationData){
								//console.log(" Notification OK");
								//console.log( notificationData);
								Network.findOne({ _id: notificationData.network._id }).populate('profiles').exec(function(errNetwork, networkData){
									console.log(networkData);
									if(!errNetwork && networkData){
										console.log("Network OK");
										networkData.accept = true;
										networkData.save(function(){
											notificationData.clicked = true;
											notificationData.status  = true;
											notificationData.save(function(err, n){
												Notification.findOne({ _id: id }).populate('network').exec(function(err,notificationData){
													console.log("Ajeno:");
													console.log(networkData.profiles);
													var ajeno = profile_ajeno(profileData._id, networkData.profiles);
													console.log( ajeno );
													Online.findOne({
														profiles: ajeno.profile._id
													}).sort({created_at: -1}).exec(function(errOnline, onlineData){
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
											});
										});
									}else{
										console.log("Network Not OK");
										console.log(errNetwork);
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
router.notification_accept2C = function(data, success, fail){
	var id = data.id;
    var guid = data.guid;


    Tokenfunc.exist2Callback(guid, function(tokenData){
    	Profilefunc.tokenToProfile2Callback(tokenData.generated_id, function(profileData){
    		Generalfunc.isValid(id, function(id){
    			Notificationfunc.getOne2Callback({ _id: id }, function(notificationData){
    				Networkfunc.accept({ _id: notificationData.network }, function(networkData){
    					console.log("ID:", id );
    					Notificationfunc.click({ _id: id },true, function(notificationData){
    						console.log(networkData.profiles);
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
    								fail(6+"!"+st);
    							});
    						});
    					}, function(st){
    						fail(5+"!"+st);
    					});// Notification Click
    				}, function(st){
    					fail(4+"!"+st);
    				});//Network Accept
    			}, function(st){
    				fail(3+"!"+st);
    			});//Notification get One 2 Callback
    		}, function(st){
    			fail(2+"!"+st);
    		});// Is Valid
    	}, function(st){
    		fail(1+"!"+st);
    	});// Profile token to profile 2 Callback
    }, function(st){
		fail(0+"!"+st);
    });// Token exist 2 callback
    
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
router.apple_push = function(type, id, socket, success, fail){

	if(type == 1){
		console.log("Type: " + type);
		Conversation.findOne({ _id: mongoose.Types.ObjectId(id) }).populate('profiles').exec(function(errConversation, conversationData){
			console.log(errConversation);
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
		console.log("Type: " + type);
		Notification.findOne({ _id: mongoose.Types.ObjectId(id) })
		.populate('profile')
		.populate('profile_emisor')
		.populate('network')
		.exec(function(err, notificationData){
			console.log(err);
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
}

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
}

router.sendPushtoAll = Generalfunc.sendPushtoAll;
router.sendPushOne = Generalfunc.sendPushOne;
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