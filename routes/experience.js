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
//var CompanyProfile = require('../models/company_profile');

var CompanyModel    = require('../models/company');

router.post('/create', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var type       = req.body.type; // 0 = independiente | 1 = company
	var company    = req.body.company;
	var job        = req.body.job;
	var speciality = req.body.speciality;
	var sector     = req.body.sector;

	func.tokenExist(guid, function(errToken, token){
		if(errToken){
			func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				if(type == 0){
					

					func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
						func.jobExistsOrCreate({
							name: job,
						},{
							name: job,
						},function(status, jobData){
							func.specialityExistsOrCreate({
								name: speciality
							},{
								name: speciality
							}, function(status, specialityData){
								var data = {
									profile_id: profileData._id,
									type: type,
									job: {
										id: jobData._id,
										name: jobData.name
									},
									speciality: {
										id: specialityData._id,
										name: specialityData.name
									}
								};
								func.experienceExistsOrCreate(data,data, function(statusExperience, experienceData){
									func.response(200,experienceData,function(response){
										res.json(response);
									});
								});
							});
						});
					});
				}else{
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

								func.sectorExistsOrCreate({
									name: sector
								},{
									name: sector
								}, function(status, sectorData){
									var data = {
										profile_id: profileData._id,
										type: type,
										job: {
											id: jobData._id,
											name: jobData.name
										},
										company: {
											id: companyData._id,
											name: companyData.name
										},
										sector: {
											id: sectorData._id,
											name: sectorData.name
										}
									};



									func.experienceExistsOrCreate(data,data, function(statusExperience, experienceData){
										func.response(200,experienceData,function(response){
											res.json(response);
										});
									});
								});
							});
							
						});
					});
				}
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
	func.tokenExist(guid, function(status, token){
		if(status){
			func.tokenToProfile(guid, function(status, userData, profileData, profileInfoData){
				if(status == 200){
					func.experienceGet(profileData._id, function(err, experiences){
						console.log(experiences);
						func.response(status, experiences, function(response){
							res.json( response );
						});
					});	
				}else{
					func.response(status, {}, function(response){
						res.json( response );
					});
				}
				
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/job/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;

	func.tokenExist(guid, function(status, token){
		if(status){	
			func.jobExistsOrCreate ({
				name: name,
			},{
				name: name,
			}, function(status, jobData){
				func.response(200, jobData, function(response){
					res.json(response);
				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/speciality/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;

	func.tokenExist(guid, function(status, token){
		if(status){	
			func.specialityExistsOrCreate ({
				name: name,
			},{
				name: name,
			}, function(status, jobData){
				func.response(200, jobData, function(response){
					res.json(response);
				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/job/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	func.tokenExist(guid, function(status, token){
		if(status){
			func.experienceJobGet(name, function(err, jobData){
				console.log(jobData);
				func.response(200,jobData, function(response){
					res.json(response);
				})
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/speciality/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	func.tokenExist(guid, function(status, token){
		if(status){
			func.experienceSpecialityGet(name, function(err, specialityData){
				console.log(specialityData);
				func.response(200,specialityData, function(response){
					res.json(response);
				})
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/sector/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;

	func.tokenExist(guid, function(status, token){
		if(status){	
			func.sectorExistsOrCreate ({
				name: name,
			},{
				name: name,
			}, function(status, sectorData){
				func.response(200, sectorData, function(response){
					res.json(response);
				});
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/sector/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	func.tokenExist(guid, function(status, token){
		if(status){
			func.sectorGet(name, function(err, jobData){
				console.log(jobData);
				func.response(200,jobData, function(response){
					res.json(response);
				})
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});

module.exports = router;
