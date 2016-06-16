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
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');


router.post('/general', multipartMiddleware, function(req, res){
	var text = req.body.search;
	var reg  = new RegExp(text, "i");
	var data = [];
	Profile.find({},function(errProfile, profileData){
		profileData.forEach(function(profileItem, profileIndex){
			var array = new Array();
			profileItem.experiences.forEach(function(expeItem, expIndex){
				array.push(expeItem.ocupation_name);
				array.push(expeItem.company_name);
				array.push(expeItem.sector_name);

				if(expIndex == (profileItem.experiences.length-1)){
					array.push(profileItem.first_name);
					array.push(profileItem.last_name);
					if( typeof profileItem.job != "undefined"){
						if(typeof profileItem.job.name != "undefined"){
							array.push(profileItem.job.name);	
						}
					}
					
					if(typeof profileItem.speciality != "undefined"){
						if(typeof profileItem.speciality.name != "undefined"){
							array.push(profileItem.speciality.name);			
						}
					}

					array.filter(function(word,index){
						if(word.match(reg)){
							data.push(profileData);
							return true;
						}else{
							return false;
						}
					});
				}
			});
			if((profileData.length-1) == profileIndex){
				func.response(200, data, function(response){
					res.json(response);
				});
			}
		});
	});
});
module.exports = router;
