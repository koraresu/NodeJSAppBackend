var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/hive');

var CompanyModel    = require('../models/company');
var Company        = db.get('company');
var CompanyProfile = db.get('company_profile');

/* GET home page. */
router.post('/create',multipartMiddleware, function(req, res, next) {

	CompanyModel.create(123, "Axovia", function(err, doc){
		res.json(doc);
	});
});
router.post('/job/create', multipartMiddleware, function(req, res, next){
	CompanyModel.createJob(123, "Villagroup","Programador", function(err, doc){
		res.json(doc);
	});
});
router.post('/get', multipartMiddleware, function(req, res, next){
	var profile_id = req.body.profile_id;
	console.log("ProfileID:"+profile_id);
	CompanyModel.getJob(123, profile_id, function(err, doc){

		res.json(doc);
	});
});

module.exports = router;
