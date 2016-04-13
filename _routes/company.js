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
var db             = require('monk')('localhost:27017/hive'),
	Company        = db.get('company'),
	CompanyProfile = db.get('company_profile');


var func = require('../func.js');

router.post('/get', multipartMiddleware, function(req, res){
	Company.insert({
		title: "Axovia",
		images: "axovia.png",
		description: "",
		website: "axovia.mx",
		industry: "Marketing, Technology",
		type: "",
		address: ""
	}, function(err, doc){
		res.send("Hola");
	});
});


module.exports = router;
