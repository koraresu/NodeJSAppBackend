
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

var getAll = function(){

}
exports.getAll           = getAll
var get = function(){

}
exports.get              = get
var insert = function(){

}
exports.insert           = insert
var update =  function(profile_id, type, company, job, speciality, sector, ocupation, callback){
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