var express             = require('express');
var router              = express.Router();
var func                = require('../func'); 
var multipart           = require('connect-multiparty');
var multipartMiddleware = multipart();

var mongoose    = require('mongoose');

var Profile     = require('../models/profile');
var User        = require('../models/user');
var Token       = require('../models/token');
var ProfileData = require('../models/profile_data');
var Job         = require('../models/job');
var Speciality  = require('../models/speciality');
var Company     = require('../models/company');



/***************************************************
*                                                  *
*   Profile Create                                 *
*   - Code                                         *
*      - 0:                                        *
*      - 1: Perfil Creado Correctamente.           *
*      - 2: El Email ya existe.                    *
*   Add New Data                                   *
*   - Create                                       *
*      - 0:                                        *
*      - 1:                                        *
*      - 2:                                        *
*                                                  *
****************************************************/

router.post('/get', multipartMiddleware, function(req, res){
	var guid = req.body.guid;
	var name = req.body.name;

	Token.findOne({ generated_id: guid }, function(errToken, guid){
		var token = guid;
		if(!errToken && guid){
			var regex = new RegExp(name,"i");
			Job.find({ name: new RegExp(name, "i")},"_id name", function(errJob, job){
				if(!errJob && job){
					res.json(job);
				}
			});
		}else{
			res.send("No Token");
		}
	});
});
router.post('/create', multipartMiddleware, function(req, res){
	var guid  = req.body.guid;
	var jobst = req.body.job;

	Token.findOne({ generated_id: guid }, function(errToken, guid){
		var token = guid;
		if(!errToken && guid){
			User.findOne({ _id: guid.user_id}, function(errUser, user){
				var account = user;
				if(!errUser && user){
					Profile.findOne({ user_id: account._id}, function(errProfile, perfil){
						var profile = perfil;
						if(!errProfile && perfil){

							Job.findOne({ name: jobst}, function(errJob, job){
								if(!errJob && job){
									j = job;
								}else{
									j = new Job({
										name: jobst
									});
									j.save();
								}
								perfil.job_id = j;
								perfil.save();

								var d = {
									name:  j.name,
									id: j._id
								};
								res.send(d);
							});


							
							
							
							
						}
					});
				}
			});
		}
	});
});
router.post('/speciality/get', multipartMiddleware, function(req, res){
	var guid = req.body.guid;
	var name = req.body.name;

	Token.findOne({ generated_id: guid }, function(errToken, guid){
		var token = guid;
		if(!errToken && guid){
			var regex = new RegExp(name,"i");
			Speciality.find({ name: new RegExp(name, "i")},"_id name", function(errEspecialidad, Especialidad){
				if(!errEspecialidad && Especialidad){
					res.json(Especialidad);
				}else{

				}
			});
		}else{
			res.send("No Token");
		}
	});
});
router.post('/speciality/create', multipartMiddleware, function(req, res){
	var guid  = req.body.guid;
	var jobst = req.body.name;

	Token.findOne({ generated_id: guid }, function(errToken, guid){
		var token = guid;
		if(!errToken && guid){
			User.findOne({ _id: guid.user_id}, function(errUser, user){
				var account = user;
				if(!errUser && user){
					Profile.findOne({ user_id: account._id}, function(errProfile, perfil){
						var profile = perfil;
						if(!errProfile && perfil){

							Speciality.findOne({ name: jobst}, function(errSpeciality, speciality){
								if(!errSpeciality && speciality){
									j = speciality;
								}else{
									j = new Speciality({
										name: jobst
									});
									j.save();
								}
								perfil._id = j;
								perfil.save();

								var d = {
									name:  j.name,
									id: j._id
								};
								res.send(d);
							});


							
							
							
							
						}
					});
				}
			});
		}
	});
});
module.exports = router;
