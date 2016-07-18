
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Generalfunc = require('./generalfunc');

var model          = require('../model');

var Profile        = require('../models/profile');
var User           = require('../models/user');
var Token          = require('../models/token');
var Job            = require('../models/job');
var Company        = require('../models/company');
var Experience     = require('../models/experience');
var Network        = model.network;
var Message        = require('../models/message');
var Conversation   = require('../models/conversation');

function addReview(profile_id_a, public_id, callback){}
function addNetwork(profile_id_a, public_id, callback){}

function message(profileData, conv, text, callback){
	Conversation.findOne({ _id: conv }).exec(function(errConversation, conversationData){
		if(!errConversation && conversationData){
			var message = new Message({
				profile_id: profileData._id,
				conversation: conversationData._id,
				message: text
			});

			message.save(function(errMessage, messageData){
				if(!errMessage && messageData){
					callback(true, messageData);
				}else{
					callback(false);
				}
			});
		}else{
			callback(false);
		}
	});
}
function otherProfile(profiles, profile_id,cb){
	var a = "";
	profiles.forEach(function(item, index){
		var i = trimUnderscores(item.toString());
		var p = trimUnderscores(profile_id.toString());
		if(i != p){
			a = i;
		}
		if(index == (profiles.length-1)){
			cb(a);
		}
	})
}
exports.otherProfile = otherProfile
function checkconversation(profile_a, profile_b, callback){

	var generated_id_a = mongoose.Types.ObjectId( profile_a );
	var generated_id_b = mongoose.Types.ObjectId( profile_b );

	var profile = [generated_id_a, generated_id_b];

	Conversation.find({
		profiles: {
			"$in" : profile
		}
	}, function(err, conversationData){
		
		if(!err && conversationData){

			if(conversationData.length > 0){
				callback(true, conversationData);
			}else{
				var conversation = new Conversation({
					profiles: profile,
					status: "active",
					message: []
				});
				conversation.save(function(err, conversationData){
					callback(false, conversationData);
				});
			}
		}
	});
}
function PublicId(public_id, callback){
	console.log("PublicId:");
	console.log(public_id);
	Profile.findOne({ public_id: public_id}).exec(function(errProfile, profileData){
		console.log(errProfile);
		if(!errProfile && profileData){
			callback(true, profileData);
		}else{
			callback(false,{});
		}
	});
}
function getFriends(profile_id,callback){
	if(typeof profile_id == "object"){
		var profile_id = mongoose.Types.ObjectId(profile_id);	
	}
	var data = [];
	Network.find({
		"profiles": {
			"$in": [profile_id]
		}
	//}).populate("profiles", "_id first_name last_name public_id qrcode profilepic").exec(function(errNetwork, networkData){
	}).exec(function(errNetwork, networkData){		
		if(networkData.length > 0){
			networkData.forEach(function(friend, index, friends){

				var a = friend.profiles.filter(function(o){
					return o.toString() != profile_id.toString() 
				});
				a = a[0];
				
				data.push(a);

				if((networkData.length-1) == index){
					callback(errNetwork, friends, data);
				}
				
			});

			/*
			networkData.forEach(function(friend, index, friends){
				primer  = friend.profiles[0]._id;
				segundo = friend.profiles[1]._id;

				var a = new Object();
				if(primer.str == profile_id.str){
					a = segundo;
				}else{
					a = primer;
				}
				data.push(a);

				if((networkData.length-1) == index){
					callback(errNetwork, friends, data);	
				}
			});
			*/
		}else{
			callback(errNetwork, {}, []);
		}
		
		
	});
}
function getNoMyID(profilesId, profile_id){
	var a = profilesId.filter(function(o){
		return o.toString() != profile_id.toString()
	});
	return a;
}
function getVecinas(friendsId,profile_id,  callback){
	console.log("ProfileID: "+profile_id.toString());
	Network.find({
		profiles: {
			"$in": friendsId
		}
	}).exec(function(errNeighbors, neighborData){
		var data = []
		//neighborData.forEach(function(neighbor, index){
		var new_data = neighborData.filter(function(neighbor){
			var notid = getNoMyID(neighbor.profiles, profile_id);
			return notid.length > 1
		});

		new_data.forEach(function(n, index){
			var a = n.profiles.filter(function(o){
				return o.toString() != profile_id.toString() 
			});
			a = a[0];
			data.push(a);
			if(new_data.length == index+1){
				callback(new_data, data);
			}
		});
	});
}
function isFriend(profile_id, another_id, callback){
	getFriends(profile_id, function(errNetwork, friendsData, friendsId){


		Network.findOne({
			"profiles": {
				"$all": [profile_id, another_id]
			}
		}).exec(function(errNetwork, networkData){
			if(!errNetwork && networkData){
				if(networkData != null){
					callback(true);
				}else{
					callback(false);
				}
			}else{
				callback(false);
			}
		});	
	});
}
exports.getVecinas          = getVecinas
exports.isFriend            = isFriend
exports.PublicId            = PublicId
exports.getFriends          = getFriends
exports.checkconversation   = checkconversation
exports.message             = message
exports.addReview           = addReview
exports.addNetwork          = addNetwork
function trimUnderscores(string) {
    return string.split(' ').join('');
}