var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var faker = require('faker');
faker.locale = "es_MX";
var mongoose    = require('mongoose');
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
					}).populate('profiles').exec(function(err, conversationData){
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

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					if(mongoose.Types.ObjectId.isValid(id)){
						id = mongoose.Types.ObjectId(id);
						Message.find({
							conversation: id
						}).populate('profile_id').exec(function(err, messageData){
							res.json(messageData);
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
						message.save(function(err, messageData){
							callback(true, messageData);
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
/*
router.post('/message', multipartMiddleware, function(req, res){
	var guid         = req.body.guid;
	var conversation = req.body.conversation;
	var text         = req.body.message;

	Tokenfunc.exist(guid, function(status, tokenData){
		console.log(status);
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					var conv = mongoose.Types.ObjectId(conversation);
					Networkfunc.message(profileData, conv, text, function(status, messageData){
						Generalfunc.response(200, format.chat_message(messageData), function(response){
							res.json(response);
						});
					});
					
				}else{
					Generalfunc.response(113, {}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			})
		}
	});

});
router.post('/check/conversation', multipartMiddleware, function(req, res){
	var text = req.body.text;
	var profile_a = req.body.a_profile;
	var profile_b = req.body.b_profile;


	Networkfunc.checkconversation(profile_a,profile_b, function(status, conversationData){

		Generalfunc.response(200, conversationData, function(response){
			res.json(response);
		})
	});
});
*/
module.exports = router;