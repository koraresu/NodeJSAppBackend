var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

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

var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');

router.post('/create', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var type       = req.body.type; // 0 = independiente | 1 = company
	var company    = req.body.company;
	var job        = req.body.job;
	var speciality = req.body.speciality;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				if(type == 0){
					

					//Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){//Revisar
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
									Generalfunc.response(200,experienceData,function(response){
										res.json(response);
									});
								});
							});
						});
					//});
				}else{
					func.companyExistsOrCreate({
						name: company
					},{
						name: company
					},function(status, companyData){
						func.jobExistsOrCreate({
							name: ocupation,
							type: 0
						},{
							name: ocupation,
							type: 0
						}, function(status, ocupationData){
							Experiencefunc.jobExistsOrCreate({
								name: job,
								type: 1
							},{
								name: job,
								type: 1
							},function(status, jobData){
								Experiencefunc.specialityExistsOrCreate({
									name: speciality
								},{
									name: speciality
								}, function(status, specialityData){

									Experiencefunc.sectorExistsOrCreate({
										name: sector
									},{
										name: sector
									}, function(status, sectorData){
										var data = {
											profile_id: profileData._id,
											type: type,
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
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			Tokenfunc.toProfile(guid, function(status, userData, profileData, profileInfoData){
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

	Tokenfunc.exist(guid, function(status, token){
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

	Tokenfunc.exist(guid, function(status, token){
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
	Tokenfunc.exist(guid, function(status, token){
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
	Tokenfunc.exist(guid, function(status, token){
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

	Tokenfunc.exist(guid, function(status, token){
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
	Tokenfunc.exist(guid, function(status, token){
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
router.post('/company/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			func.companyExistsOrCreate({
				name: name
			},{
				name: name
			}, function(status, companyData){
				func.response(200, companyData, function(response){
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
router.post('/company/get', multipartMiddleware, function(req, res){
		var guid      = req.body.guid;
	var name      = req.body.name;
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			func.companyGet(name, function(err, companyData){
				console.log(companyData);
				func.response(200,companyData, function(response){
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
