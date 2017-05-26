/**
 * Helpers de las Skills.
 *
 * @module Helpers
 */
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var async = require('async');

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
/**
 * get,
 *
 * @param {String} profile_id,
 * @param {function} callback,
 * @callback {Object}
 *
 */
function get(profile_id, callback){
	Profile.findOne({ _id: profile_id }).populate('skills','name _id').exec(function(errProfile, profileData){
		if(!errProfile && profileData){
			callback(true, profileData.skills);
		}else{
			callback(false);
		}
	});
}
/**
 * add, Crear una Skill en un Perfil.
 *
 * @param {ObjectId} profile_id, Perfil a añadir la skill.
 * @param {String} name, Nombre de la Skill.
 * @param {function} callback.
 * @callback {Object}
 *
 */
function add(profile_id, name, callback){
	
	var skills = name.split(',');
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		

		if(skills.length > 1){
			var skillsID = [];
			async.each(skills, function(skill, ca){
				skill = skill.trim();
				if(skill == ""){
					ca();
				}else{
					ExistsOrCreate({
						name: skill
					}, {
						name: skill
					}, function(status, skillData){

						var skillsD = profileData.skills.map(function(o){
							
							return o;
						});

						if(profileData.skills.length > 0){
							skillsID.push(skillData._id);
							ca();
						}else{
							skillsID.push(skillData._id);
							ca();
						}
						
					});
				}
			}, function(error,results){

				var different = skillsID.filter(function(obj) { return profileData.skills.indexOf(obj) == -1; });

				if(different.length > 0){
					different.forEach(function(item, index){
						profileData.skills.push(item);

						if((different.length-1) == index){
							profileData.save(function(err, pd){
								Skill.find({
									_id:{
										$in: different
									}
								}).exec(function(err, skills){
									callback(true, { type: 1, skills: skills}, profileData);
								});
								
							});
						}
					});
				}else{
					callback(true, { type: 1, skills: different}, profileData);
				}
			});
		}else{
			ExistsOrCreate({
				name: name
			}, {
				name: name
			}, function(status, skillData){
				var e = false;
				var skillsD = profileData.skills.map(function(o){
					
					if(o.toString() === skillData.id.toString()){
						if(!e){ e = true; }
						
						return o;
					}else{
						
						return o;
					}
					
				});
				if(e){
					callback(true, { type: 0, skill: skillData}, profileData);
				}else{
					profileData.skills.push(skillData._id);
					profileData.save(function(err, pd){
						callback(true, { type: 0, skill: skillData}, profileData);
					});
				}
			});
		}

		
	});
}
/**
 * ExistsOrCreate, Buscar una Skill, en caso de no encontrarla Crearla.
 *
 * @param {Query} search, Datos para buscar una Skill.
 * @param {Object} insert, Datos para insertar una Skill.
 * @param {function} callback.
 * @callback {Object}
 *
 */
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
/**
 * edit, Editar una Skill en un Perfil.
 *
 * @param {ObjectId} profile_id, Perfil a añadir la skill.
 * @param {String} from, Nombre del Skill Anterior.
 * @param {String} to, Nombre del NUevo Skill.
 * @param {function} callback.
 * @callback {Object}
 *
 */
function edit(profile_id, from, to, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		ExistsOrCreate({name: from},{ name: from },function(errFromSkill, skillFromData){
			ExistsOrCreate({ name: to},{ name: to},function(errSkillTo, skillToData){
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
/**
 * remove, Eliminar una Skill de un Perfil.
 *
 * @param {ObjectId} profile_id, Perfil a añadir la skill.
 * @param {String} name, Nombre del Skill a eliminar.
 * @param {function} callback.
 * @callback {Object}
 *
 */
function remove(profile_id, name, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		Skill.findOne({name: name}).exec(function(errSkill, skillData){
			var skills = profileData.skills;

			var skillsD = skills.filter(function(o){
				return o.toString() != skillData._id.toString()
			});

			profileData.skills = skillsD;
			profileData.save(function(err, profileData){
				callback(err, profileData);
			});
		});
		
	});
}
exports.ExistsOrCreate = ExistsOrCreate;
exports.add            = add;
exports.edit           = edit;
exports.delete         = remove;
exports.get            = get;