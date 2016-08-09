
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

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

var get = function(profile_id, callback){
	Profile.findOne({ _id: profile_id }).populate('skills','name _id').exec(function(errProfile, profileData){
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
			Profile.findOne({ _id: profile_id}).exec(function(errProfile, profileData){
				if(!errProfile && profileData){
					
				}else{

				}
			});
		}else{
			
		}
	});
	
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
									console.log(profileData);
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
function ExistsOrCreate(search, insert, callback){
	Skill.findOne(search, function(err, skillData){
		if(!err && skillData){
			callback(true, skillData);
		}else{
			var skill = new Skill(insert);
			skill.save(function(errSkill, skillData){
				callback(false, skillData);
			});
		}
	});
} 
var ExistsOrCreate = ExistsOrCreate
var edit = function(profile_id, from, to, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		ExistsOrCreate({name: from},{ name: from },function(errFromSkill, skillFromData){
			ExistsOrCreate({ name: to},{ name: to},function(errSkillTo, skillToData){
				var skills = profileData.skills;

				var skills = profileData.skills;
				var skillsD = skills.map(function(o){
					if(o.toString() == skillFromData._id.toString()){
						return skillToData._id;
					}else{
						return o;	
					}
				});

				profileData.skills = skillsD;
				profileData.save(function(err, profileData){
					callback(err, profileData);
				});
				
			});
		});
	});
}
var remove = function(profile_id, name, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		Skill.findOne({name: name}).exec(function(errSkill, skillData){
			var skills = profileData.skills;
			console.log(skills);
			console.log(skillData);

			var skillsD = skills.filter(function(o){
				return o.toString() != skillData._id.toString()
			});
			console.log(skillsD);
			profileData.skills = skillsD;
			profileData.save(function(err, profileData){
				callback(err, profileData);
			});
		});
		
	});
}
exports.ExistsOrCreate = ExistsOrCreate
exports.add = add
exports.edit = edit
exports.delete = remove
exports.get = get