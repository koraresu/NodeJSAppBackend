var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');

var mongoose    = require('mongoose');
var Profile     = require('../models/profile');
var User        = require('../models/user');
var Token       = require('../models/token');
var ProfileInfo = require('../models/profile_info');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');


router.post('/general', multipartMiddleware, function(req, res){
	var text = req.body.search;
	var reg  = new RegExp(text, "i");
	var data = {};
	func.searchProfile(reg, function(status, profileData){
		if(status){
			func.response(200, profileData, function(response){
				res.json(response);
			});
		}else{
			func.response(404, {}, function(response){
				res.json(response);
			});
		}
		
	});
});
module.exports = router;
