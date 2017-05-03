var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');

var async = require('async');

var mongoose    = require('mongoose');

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
var Search       = model.search;

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

	text = omitir(text);

	var reg  = new RegExp(text, "i");

	var data = [];
	var ids = [];

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Profile.find({}).populate('experiences').populate('skills').populate('user_id','-password').populate('job').exec(function(errProfile, profileData){
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


	text = omitir( text );
	text = Generalfunc.insensitive( text );

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
				Profilefunc.logs(profileData, 8, {profile: profileData, search: text }, function(){
					if(status){
						var find = {
							_id: {
								"$nin": [
									actualData._id,
									mongoose.Types.ObjectId("57b237e57a28f01f332e3447")
								]
							}
						};
						Profile.find(find).populate('experiences').populate('skills').populate('user_id','-password').exec(function(errProfile, profileData){

							async.map(profileData, function(profileItem, callback){
								
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

									if(typeof company != "undefined")
									{
										array.push("ExpC:"+company);
									}
									if(typeof sector != "undefined")
									{
										array.push("ExpS:"+sector);
									}
									if(typeof ocupation != "undefined")
									{
										array.push("ExpC:"+ocupation);
									}
								});
								profileItem.skills.forEach(function(skillItem, skillIndex){
									array.push(skillItem.name);
								});
								

								var n_array = array.filter(function(i){
									if(i == null){
										return false;
									}else{
										var match = i.match(reg);
										if( match !== null){
											return true;
										}else{
											return false;
										}
									}
									
								});
								
								if(n_array.length > 0){
									var isDisponible = ids.indexOf(profileItem._id);
									if(isDisponible == -1){
										Networkfunc.type(actualData, profileItem, function(t, contacto){
											Profilefunc.formatoProfile(profileItem._id,function( profile ){
												switch(t){
													case 0:
													profile.friend = t
													mi.push(profile);
													ids.push(profileItem._id);
													break;
													case 1:
														profile.friend_data = contacto.first_name+" "+contacto.last_name;
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
			});
		}else{
			Generalfunc.response(101,{}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/friend', multipartMiddleware, function(req, res){

});
router.post('/get', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Search.find({ profile_id: profileData._id } ).limit(5).sort({"createdAt":-1}).exec(function(err, searchData){
						Generalfunc.response(200, searchData, function(response){
							res.json(response);
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
});
router.post('/save', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var text       = req.body.search;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){

					Search.findOne({ text: text }).sort({"createdAt":-1}).exec(function(errS, sData){
						


						if(!errS && sData){
							if(sData.text != text){
								var search = new Search({
									profile_id: profileData._id,
									text: text
								});
								search.save(function(err, searchData){
									Search.find({ profile_id: profileData._id } ).limit(5).sort({"createdAt":-1}).exec(function(err, searchData){
										Generalfunc.response(200, searchData, function(response){
											res.json(response);
										});
									});
								});
							}else{
								Search.find({ profile_id: profileData._id } ).limit(5).sort({"createdAt":-1}).exec(function(err, searchData){
									Generalfunc.response(200, searchData, function(response){
										res.json(response);
									});
								});
							}
						}else{
							var search = new Search({
								profile_id: profileData._id,
								text: text
							});
							search.save(function(err, searchData){
								Search.find({ profile_id: profileData._id } ).limit(5).sort({"createdAt":-1}).exec(function(err, searchData){
									Generalfunc.response(200, searchData, function(response){
										res.json(response);
									});
								});
							});
						}
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
});
module.exports = router;
function omitir(text){

	if(text == undefined){
		return "";
	}else{
		text = text.replace('busco', '');
		text = text.replace('buscó', '');
		text = text.replace('necesito', '');
		text = text.replace('necesitó', '');
 		
		text = text.trim();
		return text;
	}
}