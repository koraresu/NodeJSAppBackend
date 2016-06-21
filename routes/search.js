var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');
var async = require("async");

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
	var ids = [];
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
					console.log(array)
				}
			});
			
			profileItem.skills.forEach(function(skillItem, skillIndex){
				array.push(skillItem.name);
			});

			array.filter(function(word,index){
				var match = word.match(reg);

				console.log(match);
				if( match !== null){

					console.log("Entrando");

					var search = ids.indexOf(profileItem._id);
					if(search == -1){
						data.push(profileItem);
						ids.push(profileItem._id);	
						console.log(profileItem);
						console.log("+++++++++");
					}

					return true;
				}else{
					return false;
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
router.post('/last-serch', multipartMiddleware, function(req, res){

});

module.exports = router;

function checkWords(array){
	
}