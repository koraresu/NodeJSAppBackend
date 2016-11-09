
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
		}, function(statusCompany, companyData){
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
	Experience.find({ profile_id: profileData._id}).exec(function(errExperience, experiencesData){
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
function companyExistsOrCreate(search, insert, callback){
	Company.findOne(search, function(err, company){
		if(!err && company){
			callback(true,company);
		}else{
			var company = new Company(insert);
			company.save();

			callback(false, company);
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

	Job.find({ name: reg }).exec(function(err, jobData){
		callback(err, jobData);
	});
}
exports.experienceSpecialityGet = function(name, callback){
	var text = name;
	var reg  = new RegExp(text, "i");

	Speciality.find({ name: reg }).exec(function(err, jobData){
		callback(err, jobData);
	});	
}
exports.companyGet = function(name, callback){
	var text = name;
	var reg  = new RegExp(text, "i");

	Company.find({ name: reg }).exec(function(err, jobData){
		callback(err, jobData);
	});
}
exports.sectorGet = function(name, callback){
	var text = name;
	var reg  = new RegExp(text, "i");

	Sector.find({ name: reg }).exec(function(err, jobData){
		callback(err, jobData);
	});
}

exports.get              = get
exports.companyExistsOrCreate    = companyExistsOrCreate
exports.jobExistsOrCreate        = jobExistsOrCreate
exports.sectorExistsOrCreate     = sectorExistsOrCreate
exports.specialityExistsOrCreate = specialityExistsOrCreate
/*
var getAll = function(){

}
exports.getAll           = getAll


function exeperienceCreate(profileData,item, callback){
	companyExistsOrCreate({
			name: item.company
		},{
			name: item.company
		},function(statusCompany, companyData){
			jobExistsOrCreate({
				name: item.ocupation
			},{
				name: item.ocupation
			}, function(statusOcupation, ocupationData){

				sectorExistsOrCreate({
					name: item.sector
				},{
					name: item.sector
				}, function(statusSector, sectorData){
					var search = {
						"company": {
							"name" : companyData.name,
							"id" : companyData._id
						},
						"ocupation" : {
							"name" : ocupationData.name,
							"id" : ocupationData._id
						},
						"profile_id": profileData._id
					};
					var create = {
						"sector":{
							"name": sectorData.name,
							"id": sectorData._id
						},
						"company": {
							"name": companyData.name,
							"id": companyData._id
						},
						"ocupation": {
							"name": ocupationData.name,
							"id": ocupationData._id
						},
						"profile_id": profileData._id
					};
					
					callback(search, create);
					
				});
				
			});
		});
}
var insert = function(profileData,data, callback){
	exeperienceCreate(profileData,data, function(search,create){
		experienceExistsOrCreate(search, create, function(errExperience, experienceData){
			callback(true, experienceData);
		});
	});
}
exports.insert           = insert

var update =  function(profile_id, type, company, sector, ocupation, callback){
	Experience.findOne({ profile_id: profile_id}, function(err, experienceData){
			




		companyExistsOrCreate({
			name: company
		},{
			name: company
		},function(status, companyData){
			jobExistsOrCreate({
				name: ocupation
			},{
				name: ocupation
			}, function(status, ocupationData){
				jobExistsOrCreate({
					name: job,
				},{
					name: job,
				},function(status, jobData){
					specialityExistsOrCreate({
						name: speciality
					},{
						name: speciality
					}, function(status, specialityData){

						sectorExistsOrCreate({
							name: sector
						},{
							name: sector
						}, function(status, sectorData){
							var data = {
								profile_id: experienceData.profile_id,
								type: experienceData.type,
								ocupation: {
									id:   ocupationData._id,
									name: ocupationData.name
								},
								job: {
									id: jobData._id,
									name: jobData.name
								},
								speciality: {
									id: specialityData._id,
									name: specialityData.name
								},
								company: {
									id: companyData._id,
									name: companyData.name
								},
								sector: {
									id: experienceData._id,
									name: experienceData.name
								}
							};


								experienceData.type = data.type;
								experienceData.ocupation = data.ocupation;
								experienceData.job = data.job;
								experienceData.speciality = data.speciality;
								experienceData.company = data.company;
								experienceData.sector = data.sector;
								experienceData.save(function(err, experienceData){
									if(!err && experienceData){
										callback(true, experienceData);
									}else{
										callback(false, experienceData);
									}
								});
						});
					});
				});
			});
		});

	});
}
exports.update           = update

function experienceExistsOrCreate(search, insert, callback){
	Experience.findOne( search , function(err, experience){
		
		if(!err && experience){
			callback(true,experience);
		}else{
			var experience = new Experience(insert);
			experience.save(function(err, experience){
				Profile.findOne({ _id: experience.profile_id}, function(errProfile, profileData){
					
					var data = [];
					Experience.find({ profile_id: profileData._id }, function(errExperience, experienceData){
						profileData.experiences = [];

						experienceData.forEach(function(item, index){
							data.push({
								ocupation_name: experience.ocupation.name,
								company_name: experience.company.name,
								sector_name: experience.sector.name,
								tipo: experience.type
							});
							if(index == (experienceData.length-1)){
								profileData.experiences = data;
								profileData.save(function(err, profileData){
									callback(err,experienceData);
								});
							}
						});
						
					});
				});
			});
		}
	});
}
exports.experienceExistsOrCreate = experienceExistsOrCreate
function companyExistsOrCreate(search, insert, callback){
	Company.findOne(search, function(err, company){
		if(!err && company){
			callback(true,company);
		}else{
			var company = new Company(insert);
			company.save();

			callback(false, company);
		}
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
function firstexperience(profile_id, callback){
	Experience.findOne({profile_id: profile_id}, function(err, experience){
		if(!err && experience){
			callback(true,experience);
		}else{
			callback(false, experience);
		}
	});
}
function experienceExists(search, callback){
	console.log("SEARCH");
	console.log(search);
	Experience.findOne(search, function(err, experience){
		if(!err && experience){
			callback(true,experience);
		}else{
			callback(false, experience);
		}
	});
}

exports.jobExistsOrCreate = jobExistsOrCreate
exports.companyExistsOrCreate = companyExistsOrCreate
exports.sectorExistsOrCreate = sectorExistsOrCreate;
exports.specialityExistsOrCreate = specialityExistsOrCreate;
*/