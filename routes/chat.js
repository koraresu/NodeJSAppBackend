var express = require('express');
var router = express.Router();
var func = require('../func'); 
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

var Profile        = require('../models/profile');
var User           = require('../models/user');
var Token          = require('../models/token');
var Job            = require('../models/job');
var Company        = require('../models/company');
var Experience     = require('../models/experience');
var Network        = require('../models/network');
var Message        = require('../models/message');
var Conversation   = require('../models/conversation');


router.post('/conversation', multipartMiddleware, function(req, res){

});
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

		func.response(200, conversationData, function(response){
			res.json(response);
		})
	});
});
module.exports = router;