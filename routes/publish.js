var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var mongoose   = require('mongoose');

var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var ObjectID = require('mongodb').ObjectID;

var Generalfunc    = require('../functions/generalfunc');
var Profilefunc    = require('../functions/profilefunc');
var Tokenfunc      = require('../functions/tokenfunc');
var Skillfunc      = require('../functions/skillfunc');
var Experiencefunc = require('../functions/experiencefunc');
var Networkfunc    = require('../functions/networkfunc');
var format         = require('../functions/format.js');

var Token       = require('../models/token');
var Profile     = require('../models/profile');
var Review      = require('../models/review');
var User        = require('../models/user');
var Job         = require('../models/job');
var Company     = require('../models/company');
var Experience  = require('../models/experience');
var History     = require('../models/history');
var Network     = require('../models/network');
var Feedback    = require('../models/feedback');

// Write Comentario
// Parameter
//  	Token
// 		Titulo
// 		Contenido
// Return (Formato 1)
// 		Comentario
router.post('/write/comentario', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var titulo    = req.body.title;
	var contenido = req.body.content;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){

				var feedback = new Feedback({
					profile_id: profileData._id,
					title: titulo,
  					content: contenido
				});
				feedback.save(function(errFeedback, feedbackData){
					Generalfunc.response(200, format.feedback(feedbackData), function(response){
						res.json(response);
					});
				});

			});
		}else{
		}
	});
});
// Write NEWS
// Parameter
//  	Token
// 		Titulo
// 		Contenido
// 		Gallery (Debe ser Arreglo)
// Return (Formato 1)
// 		News
router.post('/write/news', multipartMiddleware, function(req, res){
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
		console.log(gallery)
		gallery.forEach(function(item, index){
			

			if(item.path.constructor != Array){
				console.log("No Array");
				var objectId    = new ObjectID();
				var extension   = path.extname(item.path);
				var file_pic    = objectId + extension;

				var new_path   = path.dirname(path.dirname(process.mainModule.filename)) + '/public/gallery/' + file_pic;
				var p = '/gallery/' + file_pic;
				var d = {url:p, path: new_path};
				data.push(d);
				Generalfunc.saveImage(item, new_path, function(){
					if((gallery.length-1) == index){
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
										Generalfunc.response(200, historyData, function(response){
											res.json(historyData);	
										});
									});
								});
							}else{
								Generalfunc.response(101, {}, function(response){
									res.json(response);
								})
							}
						});
					}	
				});
			}else{
				if((gallery.length-1) == index){
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
									Generalfunc.response(200, historyData, function(response){
										res.json(historyData);	
									});
								});
							});
						}else{
							res.send("Hola");
						}
					});
				}	
			}
		});	
	}
});
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
	var action    = req.body.action;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){

				Networkfunc.getfriends(profileData._id, function(friends){
					friends.push(profileData._id);

					var search = new Object();
					search.profile_id = { "$in": friends }

					search.action = { "$in": ["1","2","3","6","7"]}

					if(typeof action == "string"){
						var actTemp = action;
						action = action.split(",")
						if(action.length == 1){
							console.log(action);
							action = actTemp;
						}
						search.action = { "$in": action }
					}
					console.log( search );
					var r = History.find( search );
					
					if(typeof max != "undefined"){
						max = max*1;
						r = r.limit(max);
					}else{
						r = r.limit(40);
					}
					if(typeof page != "undefined"){
						page = page*1;
						page = page-1;
						var pages = page*max;
						r = r.skip(pages);
					}
					r.sort( [ ['createdAt', 'descending'] ] ).exec(function(errHistory,historyData){
						var data = []
						console.log("Length:"+historyData.length);
						if(historyData.length > 0){
							historyData.forEach(function(hItem, hIndex){
								console.log(hIndex);
								Profile.findOne({
									_id: hItem.profile_id
								}, function(errProfile, profileData){
									Profile.findOne({
										_id: hItem.de_id
									}, function(errProfileDe, profileDeData){
										var profile = format.littleProfile(profileData);
										var d = format.news(hItem, profile, format.littleProfile(profileDeData));
										data.push(d);

										if(hIndex == (historyData.length-1)){
											func.response(200, data, function(response){
												res.json(response);
											});
										}
									});
								});
							});
						}else{
							Generalfunc.response(200, {}, function(response){
								res.json(response);
							});
						}
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
// GET NEWS
// Parameter
//  	Token
// 		Max (Opcional) Maximo 40
// 		Page(Opcional)
// Return (Formato 1)
// 		News
router.post('/get/review', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var max       = req.body.max;
	var page      = req.body.page;
	var pages     = max*page;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				console.log(profileData._id);
				
				var r = Review.find({profile_id: profileData._id});

				if(typeof max != "undefined"){
					max = max*1;
					r = r.limit(max);
				}
				if(typeof page != "undefined"){
					r = r.skip();
				}
				r.exec(function(errReview, reviewData){
					func.response(200, reviewData, function(response){
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
router.post('/write/review', multipartMiddleware, function(req, res){
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
