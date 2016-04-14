var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var Token       = require('../models/token');
var User        = require('../models/user');
var Job         = require('../models/job');
var Company     = require('../models/company');
var CompanyProfile = require('../models/company_profile');

var func = require('../func.js');

router.post('/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var company   = req.body.company;
	var job       = req.body.job;
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
								func.companyProfileExistsOrCreate({
									company_id: companyData._id,
									job_id: jobData._id,
									profile_id: profileData._id
								}, {
									company_id: companyData._id,
									job_id: jobData._id,
									profile_id: profileData._id
								}, function(errCompanyProfile, companyProfileData){
									func.response(200, { 
										user: userData,
										profile: profileData,
										token: tokenData.generated_id,
										data: profileInfoData
									}, function(response){
										res.json(response);
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
router.post('/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	func.getProfile(guid, function(err, data){
		var profilehive = data.hive;
		func.getProfileHive(profilehive._id, function(err, data){
			res.json(data);
		});
	});
});


module.exports = router;
