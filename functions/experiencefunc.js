
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var model = require('../model');
var Profile        = model.profile;
var User           = model.user;
var Token          = model.token;
var Job            = model.job;
var Company        = model.company;
var companyCreator = model.comp_creator;
var Experience     = model.experience;
var Network        = model.network;
var History        = model.history;
var Feedback       = model.feedback;
var Review         = model.review;
var Log            = model.log;
var Skill          = model.skill;
var Speciality     = model.speciality;
var Sector         = model.sector;
var Notification   = model.notification;
var Feedback       = model.feedback;
var Conversation   = model.conversation;
var Message        = model.message;
var City           = model.city;
var State          = model.state;
var Country        = model.country;


function checkExperience(profileData, type, data, callback){
	if(type == 0){
		console.log(data);

		jobExistsOrCreate({
			name: data.ocupation,
			type: 0
		}, {
			name: data.ocupation,
			type: 0
		}, function(statusJob, jobData){
			var search = {
						type: type,
						ocupation: {
							id: jobData._id,
							name: jobData.name
						},
						profile_id: profileData._id
					};
			console.log(search);
			Experience.findOne(search).exec(function(errExperience, experienceData){
				if(!errExperience && experienceData){

					if(experienceData != null){
						callback(true,experienceData,search);
					}else{
						callback(false,experienceData,search);
					}
				}else{
					callback(false,experienceData,search);
				}
			});
		});
	}else{
		console.log(data);

		companyExistsOrCreate({
			name: data.company
		}, {
			name: data.company
		}, profileData, function(statusCompany, companyData){
			sectorExistsOrCreate({ name: data.sector }, { name: data.sector }, function(statusSector, sectorData){
				jobExistsOrCreate({ name: data.ocupation, type: 1}, { name: data.ocupation, type: 1}, function(statusJob, jobData){
					var search = {
						type: type,
						company:{
							id: companyData._id,
							name: companyData.name
						},
						sector: {
							id: sectorData._id,
							name: sectorData.name
						},
						ocupation: {
							id: jobData._id,
							name: jobData.name
						},
						profile_id: profileData._id
					};
					Experience.findOne(search).exec(function(errExperience, experienceData){
						if(!errExperience && experienceData){

							if(experienceData != null){
								callback(true,experienceData,search);
							}else{
								callback(false,experienceData,search);
							}
						}else{
							callback(false,experienceData,search);
						}
					});
				});
			});
		})
	}
}
exports.insertOrExists = function(profileData, type, data, callback){
	checkExperience(profileData,type,data, function(statusExperience,experienceData,search){
		if(statusExperience){
			callback(false,experienceData);
		}else{
			var experience = new Experience(search);
			experience.save(function(errExperience, experienceData){
				callback(true,experienceData);
			});
			
		}
	});
}
exports.profileGenerate = function(profileData, callback){
	profileData.experiences = [];
	Experience.find({ profile_id: profileData._id}).populate('experiences').populate('skills').exec(function(errExperience, experiencesData){
		profileData.experiences = experiencesData.map(function(o){
			return o._id;
		});
		profileData.save(function(errProfile, profileData){
			callback(profileData);
		});
	});

}
function jobExistsOrCreate(search, insert, callback){
	Job.findOne(search, function(err, job){
		if(!err && job){
			callback(true,job);
		}else{
			var job = new Job(insert);
			job.save();

			callback(false, job);
		}
	});
}
function sectorExistsOrCreate(search, insert, callback){
	Sector.findOne(search, function(err, sector){
		if(!err && sector){
			callback(true, sector);
		}else{
			var sector = new Sector(insert);
			sector.save();

			callback(false, sector);
		}
	});
}
function specialityExistsOrCreate(search, insert, callback){
	Speciality.findOne(search, function(err, speciality){
		if(!err && speciality){
			callback(true,speciality);
		}else{
			var speciality = new Speciality(insert);
			speciality.save();
			callback(false, speciality);
		}
	});
}
function companyExistsOrCreate(search, insert, profileData, callback){
	Company.findOne(search, function(err, company){
		if(!err && company){
			callback(true,company);
		}else{
			var company = new Company(insert);
			company.save(function(err, company){
				var creator = new companyCreator({
					company: company._id,
					profile: profileData._id
				});
				creator.save(function(err, companyCreatorData){
					callback(false, company);
				});
			});
		}
	});
}

var get = function(profile, callback){
	Experience.find({ profile_id: profile}).exec( function(err, experiences){

		if(!err && experiences.length > 0){

			callback(true, experiences);

		}else{
			callback(false, experiences);
		}
		
	});
}
exports.experienceJobGet = function(name, callback){
	var text = name;
	var reg  = new RegExp(text, "i");

	Job.find({ name: reg }).sort({ name: "asc" }).distinct('name',function(err, jobData){
		callback(err, jobData);
	});
}
exports.experienceSpecialityGet = function(name, callback){
	var text = name;
	var reg  = new RegExp(text, "i");

	Speciality.find({ name: reg  }).sort({ name: "asc" }).distinct('name',function(err, jobData){
		callback(err, jobData);
	});	
}
exports.companyGet = function(name, callback){
	var text = name;
	var reg  = new RegExp(text, "i");

	Company.find({ name: reg  }).sort({ name: "asc" }).exec(function(err, jobData){
		callback(err, jobData);
	});
}
exports.sectorGet = function(name, callback){
	var text = name;
	var reg  = new RegExp(text, "i");

	Sector.find({ name: reg  }).sort({ name: "asc" }).distinct('name',function(err, jobData){
		callback(err, jobData);
	});
}

function formatName(text){
	return text;
}
function formatCaseInsensitive(val){
	return val;
}
exports.formatName               = formatName
exports.formatCaseInsensitive    = formatCaseInsensitive
exports.get                      = get
exports.companyExistsOrCreate    = companyExistsOrCreate
exports.jobExistsOrCreate        = jobExistsOrCreate
exports.sectorExistsOrCreate     = sectorExistsOrCreate
exports.specialityExistsOrCreate = specialityExistsOrCreate
