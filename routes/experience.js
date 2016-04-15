var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var Token       = require('../models/token');
var User        = require('../models/user');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
var ExperienceCompany = require('../models/experience_company');
var ExperienceJob     = require('../models/experience_job');
//var CompanyProfile = require('../models/company_profile');

var CompanyModel    = require('../models/company');

router.post('/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var company   = req.body.company;
	var job       = req.body.job;
	var speciality = req.body.speciality;


	func.tokenExist(guid, function(errToken, token){
		if(errToken){
			func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				func.companyExistsOrCreate({
					name: company
				},{
					name: company
				},function(status, companyData){
					func.jobExistsOrCreate({
						name: job,
					},{
						name: job,
					},function(status, jobData){
						console.log(jobData);
						func.specialityExistsOrCreate({
							name: speciality
						},{
							name: speciality
						}, function(status, specialityData){
								func.experienceExistsOrCreate({
									profile_id: profileData._id,
									speciality_id: specialityData._id
								},{
									profile_id: profileData._id,
									speciality_id: specialityData._id
								}, function(errExperience, experienceData){
									func.experienceCompanyExistsOrCreate({
										experience_id: experienceData._id,
										company_id: company._id
									},{
										experience_id: experienceData._id,
										company_id: company._id
									}, function(status, experienceCompanyData){
										func.experienceJobExistsOrCreate({
											experience_id: experienceData._id,
											job_id: jobData._id
										},{
											experience_id: experienceData._id,
											job_id: jobData._id
										}, function(status, experienceJobData){
											var data = {
												experience:experienceData,
												experience_company: experienceCompanyData,
												experience_job: experienceJobData,
												speciality: specialityData,
												job:   jobData,
												company: companyData
											};
											res.json(data);
										});
									})
								});
						});
						
					});
				});
			});
		}else{
			func.response(101,{}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	func.experienceGet(guid, function(err, experiences){
		res.json(experiences);
	});
});

module.exports = router;
