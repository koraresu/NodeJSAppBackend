var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var ObjectID = require('mongodb').ObjectID;

var Generalfunc = require('../functions/generalfunc');
var Profilefunc = require('../functions/profilefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Experiencefunc = require('../functions/experiencefunc');

var Token       = require('../models/token');
var Profile     = require('../models/profile');
var Review      = require('../models/review');
var User        = require('../models/user');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
var History     = require('../models/history');


// GET NEWS
// Parameter
//  	Token
// 		Max (Opcional) Maximo 40
// 		Page(Opcional)
// Return (Formato 1)
// 		News
router.post('/get/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var max       = req.body.max;
	var page      = req.body.page;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				console.log(profileData._id);
				
				var r = History.find({profile_id: profileData._id, action: 1});

				if(typeof max != "undefined"){
					max = max*1;
					r = r.limit(max);
				}
				
				r.exec(function(errHistory, historyData){
					var data = []
					historyData.forEach(function(hItem, hIndex){
						Profile.findOne({_id: hItem.profile_id}, function(errProfile, profileData){
							var d = {
								profile: profileData,
								history: hItem
							};

							data.push(d);

							if(hIndex == (historyData.length-1)){
								func.response(200, data, function(response){
									res.json(response);
								});
							}
						});


					});
				});
			});
		}else{
			func.response(101, {},function(response){
				res.json(response);
			})
		}
	});
});

// GET REVIEWS
// CREATE NEWS
// CREATE REVIEWS
// CREATE FEEDBACK