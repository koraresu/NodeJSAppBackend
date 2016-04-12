var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var Token       = require('../models/token');
var User        = require('../models/user');
var Job         = require('../models/job');
var Company     = require('../models/company');
var ProfileHive = require('../models/profile_hive');

var func = require('../func.js');

router.post('/create',multipartMiddleware,  function(req, res) {

	var guid      = req.body.guid;
	var company   = req.body.company;
	var job       = req.body.job;

	func.getProfile(guid, function(err, data){
		var jobEl = new Job({
			name: job,
		});
		jobEl.save();

		var companyEl = new Company({
			name:  company, 
			job_id: jobEl
		});

		companyEl.save();
		
		var profilehive = new ProfileHive({
			job_id: jobEl,
			company_id: companyEl, 
			profile_id: data.profile,

		});
		profilehive.save();
		
		func.getProfileHive(profilehive._id, function(err, data){
			res.json(data);
		});
		
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
