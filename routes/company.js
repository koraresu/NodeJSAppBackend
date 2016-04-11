var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var Job         = require('../models/job');
var Company     = require('../models/company');
var ProfileHive = require('../models/profile_hive');


router.post('/create',multipartMiddleware,  function(req, res) {

	var guid      = req.body.guid;
	var company   = req.body.company;
	var job       = req.body.job;
	Token.findOne({ generated_id: guid}, function(errToken, guid){
		Us
		if(!errToken && guid){

			var jobEl = new Job({
				name: job,
			});
			jobEl.save();

			var companyEl = new Company({
				name:  company, 
				job_id: job
			});

			companyEl.save();


			var profilehive = new ProfileHive({
				job_id: jobEl,
				company_id: companyEl, 
				

				profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
			});


			res.json({
				job: jobEl, 
				company: companyEl
			});
		}
	});
	
});


module.exports = router;
