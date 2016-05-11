
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var ProfileInfo        = require('../models/profile_info');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');

var add = function(profile_id, name, callback){
	Skill.findOne({ name: name}, function(err, skillData){
		if(!err && skillData){
			Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
					

				Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
					var data = {
						name: skillData.name,
						id: skillData._id
					};
					console.log(data);
					profileData.skills.push(data);
					
					profileData.save(function(err, profileData){
						callback(true, skill, profileData);
					});
				});

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
					console.log(data);
					profileData.skills.push(data);
					
					profileData.save(function(err, profileData){
						callback(false, skill, profileData);
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