var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');

var async = require('async');

var mongoose    = require('mongoose');
var model       = require('../model');

var Profile     = model.profile;
var User        = model.user;
var Token       = model.token;
var Job         = model.job;
var Company     = model.company;
var Experience  = model.experience;
var Log         = model.log;
var Generalfunc = require('../functions/generalfunc');
var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Networkfunc    = require('../functions/networkfunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Historyfunc = require('../functions/historyfunc');
var format = require('../functions/format');

router.post('/general', multipartMiddleware, function(req, res){
	var text = req.body.search;
	var guid       = req.body.guid;

	var reg  = new RegExp(text, "i");

	var data = [];
	var ids = [];

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Profile.find({}).populate('experiences').populate('skills').populate('user_id','-password').exec(function(errProfile, profileData){
						profileData.forEach(function(profileItem, profileIndex){
							var array = new Array();
							
							array.push(profileItem.first_name);
							array.push(profileItem.last_name);
							array.push(profileItem.speciality.name);
							array.push(profileItem.job.name);

							profileItem.experiences.forEach(function(experienceItem, experienceIndex){
								var company   = experienceItem.company.name;
								var sector    = experienceItem.sector.name;
								var ocupation = experienceItem.ocupation.name;

								array.push(experienceItem.company.name);
								array.push(experienceItem.sector.name);
								array.push(experienceItem.ocupation.name);
							});
							profileItem.skills.forEach(function(skillItem, skillIndex){
								array.push(skillItem.name);
							});

							var n_array = array.filter(function(i){
								var match = i.match(reg);
								if( match !== null){
									return true;
								}else{
									return false;
								}
							});

							if(n_array.length > 0){
								var isDisponible = ids.indexOf(profileItem._id);
								if(isDisponible == -1){
									data.push(profileItem);
									ids.push(profileItem._id);	
								}
							}
							if(profileData.length == profileIndex+1){
								Generalfunc.response(200, data, function(response){
									res.json(response);
								});
							}
						});
					});
				}else{
					Generalfunc.response(113,{}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101,{}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/general/network', multipartMiddleware, function(req, res){
	var text = req.body.search;
	var guid       = req.body.guid;

	var reg  = new RegExp(text, "i");

	var data = [];
	var mi      = [];
	var vecinas = [];
	var otros   = [];
	var ids = [];

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				var actualData = profileData;
				if(status){
					Profile.find({ _id: { "$ne": actualData._id }}).populate('experiences').populate('skills').populate('user_id','-password').exec(function(errProfile, profileData){

						async.forEach(profileData, function(profileItem, callback){
							var array = new Array();
							array.push(profileItem.first_name);
							array.push(profileItem.last_name);

							if(typeof profileItem.speciality.name != "undefined"){
								array.push(profileItem.speciality.name);	
							}
							if(typeof profileItem.job.name != "undefined"){
								array.push(profileItem.job.name);
							}

							profileItem.experiences.forEach(function(experienceItem, experienceIndex){
								var company   = experienceItem.company.name;
								var sector    = experienceItem.sector.name;
								var ocupation = experienceItem.ocupation.name;

								array.push(experienceItem.company.name);
								array.push(experienceItem.sector.name);
								array.push(experienceItem.ocupation.name);
							});
							profileItem.skills.forEach(function(skillItem, skillIndex){
								array.push(skillItem.name);
							});
							
							var n_array = array.filter(function(i){
								var match = i.match(reg);
								if( match !== null){
									return true;
								}else{
									return false;
								}
							});
							
							if(n_array.length > 0){
								var isDisponible = ids.indexOf(profileItem._id);
								if(isDisponible == -1){
									Networkfunc.type(actualData, profileItem, function(t){
										Profilefunc.formatoProfile(profileItem._id,function( profile ){
											switch(t){
												case 0:
													profile.friend = t
													mi.push(profile);

													ids.push(profileItem._id);
												break;
												case 1:
													profile.friend = t
													vecinas.push(profile);
													ids.push(profileItem._id);
												break;
												case 2:
													profile.friend = t
													otros.push(profile);
													ids.push(profileItem._id);
												break;
											}
											callback();
										});

										
									});
								}else{
									callback();
								}
							}else{
								callback();
							}
							
						}, function(results){
							data = {
								mi: mi,
								vecinas: vecinas,
								otros: otros
							}
							Generalfunc.response(200, data, function(response){
								res.json(response);
							});

						});
				});
		}else{
			Generalfunc.response(113,{}, function(response){
				res.json(response);
			});
		}
	});
}else{
	Generalfunc.response(101,{}, function(response){
		res.json(response);
	});
}
});
});
router.post('/general/network/friends', multipartMiddleware, function(req, res){
	var rael   = mongoose.Types.ObjectId("578c3985021e94d11de142cf");
	var memo   = mongoose.Types.ObjectId("578c84e48bae9a04b27fb4e8");
	var carlos = mongoose.Types.ObjectId("578c9001efe81531b41bc53f");

	Profile.findOne({_id: rael}).exec(function(err, rael){
		Profile.findOne({_id: carlos }).exec(function(err, carlos){
			Networkfunc.isNeightbor(rael, carlos, function(status){
				res.send(""+status);
			});
		});
	});
});

module.exports = router;