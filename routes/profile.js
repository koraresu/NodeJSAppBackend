var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/hive');

var ProfileModel    = require('../models/profile');
var Company        = db.get('company');
var CompanyProfile = db.get('company_profile');

/* GET home page. */
router.post('/create',multipartMiddleware, function(req, res, next) {

	ProfileModel.create("rael", "corrales", function(err, doc){
		res.json(doc);
	});
});

module.exports = router;
