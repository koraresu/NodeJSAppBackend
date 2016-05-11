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
module.exports = router;
