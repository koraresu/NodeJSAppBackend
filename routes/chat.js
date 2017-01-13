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
  production: false,
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
						res.json(conversationData);
					});
				}else{

				}
			});
		}else{

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
											]
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

					Device.findOne({ profile: profileData._id, token: deviceID }).exec(function(errDevice, deviceData){
						if(!errDevice && deviceData){
							callback(true, deviceData, profileData );	
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
								console.log("DEviceData:");
								console.log(deviceData);
								
								callback(true, deviceData, profileData );
							});
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
router.sendPush = function(device_id, message, payload, callback){
	var note = new apn.Notification();
  var deviceToken = req.params.device_id;
  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 3;
  note.sound = "ping.aiff";
  note.alert = message;
  note.payload = {'messageFrom': payload};
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
router.deviceajeno = function(conversation, socket, callback){

	console.log("/******* Chat Apple Push Notification *****/");
        console.log("Socket:"+socket);
        console.log("Conversation:" + conversation );

	Conversation.findOne({ _id: mongoose.Types.ObjectId(conversation) }).exec(function(errConversation, conversationData){
		var profiles = conversationData.profiles;
		Online.findOne({ socket: socket }).exec(function(errOnline, onlineData){
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

			Device.findOne({ profile: t }).exec(function(errDevice, deviceData){
				if(!errDevice && deviceData){
					callback(true,deviceData);
				}else{
					callback(false,{});
				}
			});
		});
	});
}
module.exports = router;