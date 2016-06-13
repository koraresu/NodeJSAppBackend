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
var Review      = require('../models/review');
var User        = require('../models/user');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
var History     = require('../models/history');
//var ExperienceCompany = require('../models/experience_company');
//var ExperienceJob     = require('../models/experience_job');
//var CompanyProfile = require('../models/company_profile');

var CompanyModel    = require('../models/company');

/*
router.post('/', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

});
*/
router.post('/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var titulo    = req.body.title;
	var contenido = req.body.content;
	var gallery   = req.files.gallery;

	var data = [];
	if(typeof gallery == "undefined"){
		Tokenfunc.exist(guid, function(status, tokenData){
			if(status){
				Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						

							var h = {};
							h.title = titulo;
							h.content =contenido;
							h.gallery = data;
							
							var history = new History({
								profile_id: profileData._id,
			  					de_id: profileData._id,
			  					action: 1,
			  					data: h
							});
							history.save(function(err, historyData){
								res.json(historyData);
							});
						
					
				});
			}else{
				func.response(101, {}, function(response){
					res.json(response);
				});
			}
		});
	}else{
		gallery.forEach(function(item, index){
			var objectId    = new ObjectID();
			var extension   = path.extname(item.path);
			var file_pic    = objectId + extension;

			var new_path   = path.dirname(path.dirname(process.mainModule.filename)) + '/public/gallery/' + file_pic;
			var p = '/gallery/' + file_pic;
			var d = {url:p, path: new_path};
			data.push(d);

			Tokenfunc.exist(guid, function(status, tokenData){
				if(status){
					Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
						Generalfunc.saveImage(item, new_path, function(){
							if( (gallery.length-1) == index){

								var h = {};
								h.title = titulo;
								h.content =contenido;
								h.gallery = data;
								
								var history = new History({
									profile_id: profileData._id,
				  					de_id: profileData._id,
				  					action: 1,
				  					data: h
								});
								history.save(function(err, historyData){
									res.json(historyData);
								});
							}
						});
					});
				}else{

				}
			});
		});	
	}
	
});
router.post('/get/review', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var max       = req.body.max;
	var page      = req.body.page;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				var r = Review.find({ profile_id: profileData._id });

				if(typeof max != "undefined"){
					max = max*1;
					r = r.limit(max);
				}
				r.exec(function(errReview, reviewData){

					reviewData.forEach(function(rItem, rIndex){

					});
					func.response(200, {profile: profileData, review: reviewData }, function(response){
						res.json(response);
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
router.post('/review', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var public_id = req.body.public_id;

	var title = req.body.title;
	var content = req.body.content;
	var score   = req.body.score;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				Profilefunc.publicId(public_id, function(statusPublic, publicProfileData){
					if(statusPublic){

						var review = new Review({
							title: title,
							content: content,
							rate: score,
							profiles: [profileData._id,publicProfileData._id],
							profile_id: publicProfileData._id
						});
						review.save(function(errReview, reviewData){
							func.response(200, reviewData, function(response){
								res.json(response);
							});
						});

						
					}else{
						func.response(101, {"message": "publicNotFound"}, function(response){
							res.json(response);
						});
					}
					
				})
			});
		}else{
			func.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
module.exports = router;
