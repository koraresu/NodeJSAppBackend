
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');

var get = function(profile_id, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		if(!errProfile && profileData){
			callback(true, profileData.skills);
		}else{
			callback(false);
		}
	});
}
var add = function(profile_id, name, callback){
	console.log(profile_id);
	Skill.findOne({ name: name}, function(err, skillData){
		if(!err && skillData){
			Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
				if(!errProfile && profileData){
					var data = {
						name: skillData.name,
						id: skillData._id
					};
					var insertar = true;
					console.log(profileData);
					if(profileData.skills.length == 0){
						if(insertar){
							profileData.skills.push(data);
						}
						profileData.save(function(err, profileData){
							callback(true, skill, profileData);
						});
					}else{
						profileData.skills.forEach(function(item, index){

							if(item.name == name){
								insertar = false;
							}
							if(index == (profileData.skills.length-1)){
								if(insertar){
									profileData.skills.push(data);
								}
								profileData.save(function(err, profileData){
									callback(true, skill, profileData);
								});
							}
						});	
					}
					
				}else{
					console.log("no Profile");
					callback(false);
				}
			});
		}else{
			var skill = new Skill({
				name: name
			});
			skill.save(function(err, skillData){
				Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
					var data = {
						name: skillData.name,
						id: skillData._id
					};
					var insertar = true;
					console.log(profileData.skills);
					profileData.skills.forEach(function(item, index){

						if(item.name == name){
							insertar = false;
						}
						if(index == (profileData.skills.length-1)){
							if(insertar){
								profileData.skills.push(data);
							}
							profileData.save(function(err, profileData){
								callback(true, skill, profileData);
							});
						}
					});
				});
			});
		}
	});
}
var remove = function(profile_id, name, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		var skills = [];
		profileData.skills.forEach(function(item, index){
			if(item.name != name){
				skills.push(item);
			}

			if(index == (profileData.skills.length-1)){
				console.log(skills);

				profileData.skills = skills;
				profileData.save(function(err, profileData){
					callback(err, profileData);
				});
			}
		});

	});
}
exports.add = add
exports.delete = remove
exports.get = get