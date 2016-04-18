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
//var ExperienceCompany = require('../models/experience_company');
//var ExperienceJob     = require('../models/experience_job');
//var CompanyProfile = require('../models/company_profile');

var CompanyModel    = require('../models/company');

router.post('/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var company   = req.body.company;
	var job       = req.body.job;
	var speciality = req.body.speciality;

	res.send("Hola");
});
/*
router.post('/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var company   = req.body.company;
	var job       = req.body.job;
	var speciality = req.body.speciality;
	func.tokenExist(guid, function(errToken, token){
		if(!errToken && token){
			func.tokenToProfile(token, function(status, userData, profileData, profileInfoData){
				switch(status){
					case 200:
						func.companyExistsOrCreate({
							title: company
						}, {
							title: company
						}, function(errCompany, companyData){
							func.jobExistsOrCreate({
								name: job
							}, {
								name: job
							}, function(errJob, jobData){
								func.specialityExistsOrCreate({
									name: speciality
								},{
									name: speciality
								},function(errSpeciality, specialityData){
									func.experienceExistsOrCreate({
										profile_id: profileData._id
									}, {
										profile_id: profileData._id,
										speciality_id: specialityData._id
									}, function(errExperience, experienceData){

									});
								});
							});
						});
					break;
					case 111:
						func.response(111, {}, function(response){
							res.json(response);
						});
					break;
				}
			});
		}else{
			func.response(101, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/delete', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var company_profile = req.body.company_profile_id;

	func.tokenExist(guid, function(errToken, token){
		if(!errToken && token){
			func.tokenToProfile(token, function(errProfile, erruser, userData, profileData){
				func.companyProfileCheck({ _id: company_profile, profile_id: profileData._id}, function(errCompanyProfileCheck, companyProfileData){
					companyProfileData.remove().exec();
					if(!errCompanyProfileCheck){
						func.response(200, function(response){
							res.json(response);
						});
					}
					
				});
			});
		}
	});
});
router.post('/job/create', multipartMiddleware, function(req, res, next){
	CompanyModel.createJob(123, "Villagroup","Programador", function(err, doc){
		res.json(doc);
	});
});
router.post('/get', multipartMiddleware, function(req, res, next){
	var profile_id = req.body.profile_id;
	console.log("ProfileID:"+profile_id);
	CompanyModel.getJob(123, profile_id, function(err, doc){

		res.json(doc);
	});
});

*/
module.exports = router;
