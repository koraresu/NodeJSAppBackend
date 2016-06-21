
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Generalfunc = require('./generalfunc');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');
var Conversation    = require('../models/conversation');

function addReview(profile_id_a, public_id, callback){}
function addNetwork(profile_id_a, public_id, callback){}

function message(conversation_id, text, callback){
	/*
	Conversation.find({_id: conversation_id, function(err, conversationData){
		if(!err && conversationData){
			callback(true, conversationData);
		}else{
			callback(false, conversationData);
		}
	});
	*/
}
function checkconversation(profile_a, profile_b, callback){

	var generated_id_a = mongoose.Types.ObjectId( profile_a );
	var generated_id_b = mongoose.Types.ObjectId( profile_b );

	var profile = [];
	profile.push( generated_id_a );
	profile.push( generated_id_b );

	console.log(profile);

	Conversation.find({ profile: { "$in" : profile } }, function(err, conversationData){
		if(!err && conversationData){
			callback(true, conversationData);
		}else{

			

			console.log(profile);

			var conversation = new Conversation({
				profile: profile,
				status: "active",
				message: []
			});
			conversation.save(function(err, conversationData){
				callback(false, conversationData);
			});
		}
	});
}
exports.checkconversation   = checkconversation
exports.message             = message
exports.addReview           = addReview
exports.addNetwork          = addNetwork