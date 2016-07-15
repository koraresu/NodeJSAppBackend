
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

function checkExperience(profileData,ocupation, company, sector, callback){
	console.log("ProfileData:");
	console.log(profileData);

	companyExistsOrCreate({ name: company}, { name: company}, function(statusCompany, companyData){
		sectorExistsOrCreate({ name: sector }, { name: sector }, function(statusSector, sectorData){
			jobExistsOrCreate({ name: ocupation}, { name: ocupation}, function(statusJob, jobData){
				var search = {
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
						if(experienceData.length > 0){
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
exports.insertOrExists = function(profileData,ocupation, company, sector, callback){
	checkExperience(profileData,ocupation, company, sector, function(statusExperience,search,experienceData){
		if(statusExperience){
			var experience = new Experience(search);
			experience.save(function(errExperience, experienceData){
				callback(true,experienceData);
			});
		}else{
			callback(false,experienceData);
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
exports.companyExistsOrCreate    = companyExistsOrCreate
exports.jobExistsOrCreate        = jobExistsOrCreate
exports.sectorExistsOrCreate     = sectorExistsOrCreate
exports.specialityExistsOrCreate = specialityExistsOrCreate
/*
var getAll = function(){

}
exports.getAll           = getAll
var get = function(profile, callback){
	Experience.find({ profile_id: profile}).exec( function(err, experiences){

		if(!err && experiences.length > 0){

			callback(true, experiences);
		
		}else{
			callback(false, experiences);
		}
		
	});
}
exports.get              = get


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