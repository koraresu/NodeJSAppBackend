var express = require('express');
var router = express.Router();

var mongoose    = require('mongoose');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var model        = require('../model');
var Profile      = model.profile;
var User         = model.user;
var Token        = model.token;
var Job          = model.job;
var Company      = model.company;
var CompanyClaim = model.company_claim;
var Experience   = model.experience;
var Network      = model.network;
var History      = model.history;
var Feedback     = model.feedback;
var Review       = model.review;
var Log          = model.log;
var Skill        = model.skill;
var Speciality   = model.speciality;
var Sector       = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Generalfunc = require('../functions/generalfunc');
var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Networkfunc    = require('../functions/networkfunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Historyfunc = require('../functions/historyfunc');
var format = require('../functions/format');


/*
router.post('/create', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var type       = req.body.type; // 0 = independiente | 1 = company
	var company    = req.body.company;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				if(type == 0){
					

					//Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){//Revisar
						Experiencefunc.jobExistsOrCreate({
							name: job,
						},{
							name: job,
						},function(status, jobData){
							Experiencefunc.specialityExistsOrCreate({
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
								Experiencefunc.insertOrExists(profileData,type, data, function(statusExperience, experienceData){
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
					Experiencefunc.get(profileData._id, function(err, experiences){
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
	var type      = req.body.type;

	Tokenfunc.exist(guid, function(status, token){
		if(status){	
			Experiencefunc.jobExistsOrCreate ({
				name: name,
				type: type
			},{
				name: name,
				type: type
			}, function(status, jobData){

				Generalfunc.response(200, jobData, function(response){
					res.json(response);
				});
			});
		}else{
			Generalfunc.response(101, {}, function(response){
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
router.post('/company/create', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			Experiencefunc.companyExistsOrCreate({
				name: name
			},{
				name: name
			}, function(status, companyData){
				Generalfunc.response(200, companyData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
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
			Experiencefunc.sectorExistsOrCreate ({
				name: name,
			},{
				name: name,
			}, function(status, sectorData){
				Generalfunc.response(200, sectorData, function(response){
					res.json(response);
				});
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
*/
router.post('/job/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			Experiencefunc.experienceJobGet(name, function(err, jobData){

				Generalfunc.response(200,jobData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
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
			Experiencefunc.experienceSpecialityGet(name, function(err, specialityData){
				console.log(specialityData);
				Generalfunc.response(200,specialityData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
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
			Experiencefunc.sectorGet(name, function(err, jobData){
				console.log(jobData);
				Generalfunc.response(200,jobData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
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
			Experiencefunc.companyGet(name, function(err, companyData){
				console.log(companyData);
				Generalfunc.response(200,companyData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/company/claim', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.id;

	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId(id);
	}
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Profilefunc.formatoProfile(profileData._id,function( profile ){
						var claim = new CompanyClaim({
							profile: profileData._id,
							company: id
						});
						
						claim.save(function(err, c_claim){
							CompanyClaim.find({ _id: c_claim._id }).populate('profile').populate('company').exec(function(errComp, compData){
								Generalfunc.response(200, compData, function(response){
									res.json(response);
								})
							});
							
						});
					});
				}else{
					Generalfunc.response(101, {}, function(response){
							res.json(response);
						})
				}
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/company/update', multipartMiddleware, function(req, res){ // Update Description
	var guid        = req.body.guid;
	var id          = req.body.id;
	var description = req.body.description;

	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					if(mongoose.Types.ObjectId.isValid(id)){
						id = mongoose.Types.ObjectId(id);
						Company.findOne({ _id: id }).exec(function(err, companyData){
							if(companyData.profile_id == profileData._id){
								if(description.length <= 200){
									companyData.description = description;
									companyData.save(function(err, companyData){
										Generalfunc.response(200, companyData, function(response){
											res.json(response);
										});
									});
								}else{
									Generalfunc.response(101, { message: "La descripcion es mayor." }, function(response){
										res.json(response);
									});
								}
							}else{	
								Generalfunc.response(101, { message: "This profile doesn't have permission to change." }, function(response){
									res.json(response);
								});
							}
						});
					}else{
						Generalfunc.response(101, { message: "id is not valid." }, function(response){
							res.json(response);
						});	
					}
				}else{
					Generalfunc.response(101, { message: "token dont have profile."}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101, { message: "token doesn't exists." }, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/company/getid', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.id;
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId(id);
		Tokenfunc.exist(guid, function(status, token){
			if(status){
				Company.findOne({ _id: id }).exec(function(err, companyData){
					Experience.find({ "company.id": id }).populate('profile_id').exec(function(err, experienceData){
						var data = {
							company: companyData,
							trabajo: experienceData
						};
						Generalfunc.response(200,data, function(response){
							res.json(response);
						});
						
					});
				});
			}else{
				Generalfunc.response(101, {}, function(response){
					res.json(response);
				});
			}
		});
	}else{
		Generalfunc.response(101, {}, function(response){
			res.json(response);
		});
	}
	
});

module.exports = router;
