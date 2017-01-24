
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Generalfunc = require('./generalfunc');

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
	console.log("PUBLIC_ID:");
	console.log(public_id);
	Profile.findOne({ public_id: public_id}).exec(function(errProfile, profileData){
		console.log("ERROR PROFILE:");
		console.log(errProfile);
		if(!errProfile && profileData){
			
			console.log(profileData);

			callback(true, profileData);
		}else{
			callback(false,{});
		}
	});
}
function getListFriends(profile_id,callback){
	if(typeof profile_id == "object"){
		var profile_id = mongoose.Types.ObjectId(profile_id);	
	}
	var data = [];
	Network.find({
		"profiles": {
			"$in": [profile_id]
		},
		"accepted": true
	}).exec(function(errNetwork, networkData){		
		if(networkData.length > 0){
			networkData.forEach(function(friend, index, friends){

				var a = friend.profiles.filter(function(o){
					return o.toString() != profile_id.toString() 
				});
				a = a[0];
				console.log("A");
				console.log(a);
				
			});
		}else{
			callback(errNetwork, {}, []);
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
		},
		"accepted": true
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
function isNeightbor(profile_id, another_id, callback){
	var lvl = 0;

	getFriends(profile_id._id, function(errFirst, firstData, firstIds){
		if(firstIds.length>0){
			firstIds.forEach(function(firstItem, firstIndex){
				getFriends(firstItem, function(errSecond, secondData, secondIds){

					var x = secondIds.filter(function(y){
						return y.toString() == another_id._id.toString()
					});
					if(x.length > 0){
						lvl = 1;
					}
					if(firstIndex+1 == firstIds.length){
						if(lvl == 1){
							callback(1, firstItem);
						}else{
							callback(2);
						}
					}
				});
			});
			
		}else{
			callback(0);
		}
	});
}
function isFriend(profile_id, another_id, callback){
	var d = {
		"profiles": {
			"$all": [profile_id, another_id]
		},
		"accepted": true
	};
	console.log(d);
	Network.findOne(d).exec(function(errNetwork, networkData){
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
}
function typeFriend(profile_id, another_id, callback){
	var d = {
		"profiles": {
			"$all": [profile_id, another_id]
		}
	};
	console.log(d);
	Network.findOne(d).exec(function(errNetwork, networkData){
		if(!errNetwork && networkData){
			if(networkData.accepted == true){
				callback(2);
			}else{
				callback(1);
			}
			
		}else{
			callback(0);
		}
	});	
}
function type(profileID, anotherID, callback){
	getFriends(anotherID._id, function(errNetwork, friends, friendsId){
		console.log(friendsId);
		var its = friendsId.filter(function(o){
			var a = o.toString();
			var b = profileID._id.toString();

			return a != b
		});
		if(friendsId.length == its.length){
			isNeightbor(profileID, anotherID, function(status, friendId){
				if(status == 1){
					Profile.findOne({ _id: friendId }).exec(function(errP, pData){
						callback(1, pData);
					});
					
				}else{
					callback(2);
				}
			});
		}else{
			callback(0,anotherID);
		}
	});
}
function getOne2Callback(search, success, fail){

}
function accept(search, success, fail){
	Network.findOne(search).exec(function(errNetwork, networkData){
		if(!errNetwork && networkData){
			networkData.accepted = true;
			networkData.save(function(err, network){
				if(!err && network){
					Network.findOne(search).exec(function(errNetwork, networkData){
						if(!errNetwork && networkData){
							success(networkData);
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
exports.accept              = accept
exports.getOne2Callback     = getOne2Callback
exports.type                = type
exports.isNeightbor         = isNeightbor
exports.isFriend            = isFriend
exports.typeFriend            = typeFriend
exports.PublicId            = PublicId
exports.getFriends          = getFriends
exports.getListFriends      = getListFriends
exports.checkconversation   = checkconversation
exports.message             = message
exports.addReview           = addReview
exports.addNetwork          = addNetwork
function trimUnderscores(string) {
    return string.split(' ').join('');
}
function cleanArray(actual) {
	var newArray = new Array();
	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}
	return newArray;
}