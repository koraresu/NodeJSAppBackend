	var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var mongoose   = require('mongoose');
var _ = require('underscore');

var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var shortid = require('shortid');
var ObjectID = require('mongodb').ObjectID;

var Generalfunc    = require('../functions/generalfunc');
var Profilefunc    = require('../functions/profilefunc');
var Tokenfunc      = require('../functions/tokenfunc');
var Skillfunc      = require('../functions/skillfunc');
var Historyfunc    = require('../functions/historyfunc');
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

var model = require('../model');

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

function save_news(profileData, title, content, gallery,callback){
	var h = {
		title: title,
		content: content,
		gallery: gallery
	};
	Historyfunc.insert({
		profile_id: profileData._id,
		de_id: profileData._id,
		action: 1,
		data: h
	}, function(err, historyData){
		callback(historyData);
	});
}
router.post('/write/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var titulo    = req.body.title;
	var contenido = req.body.content;
	var gallery   = req.files.gallery;
	var data = [];

	Tokenfunc.exist(guid, function(status, tokenData){
	
			if(status){
				Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
					if(status){
						if(typeof gallery == "undefined"){
							save_news(profileData, titulo, contenido, [], function(historyData){
								
								var profile = format.littleProfile(profileData);
								var de = format.littleProfile(profileData);
								var d = format.news(historyData, profile, de);
								Generalfunc.response(200,d, function(response){
									res.json(response);
								});

							});
						}else{
							if(gallery.length > 0){
								gallery.forEach(function(item, index){
									var file = item;
									var objectId    = new ObjectID();
									var fileName  = file.fieldName;
									var pathfile  = file.path;
									var extension = path.extname(pathfile);
									var file_pic    = shortid.generate() + extension;

									var new_path = path.dirname(path.dirname(process.mainModule.filename)) + '/public/gallery/' + file_pic;
									fs.rename(pathfile, new_path, function(err){
										if (err){
											throw err;
										}else{
											var p = file_pic;
											data.push({url: p});

											if(index == (gallery.length-1)){
												save_news(profileData, titulo, contenido, data, function(historyData){
													var profile = format.littleProfile(profileData);
													var de = format.littleProfile(profileData);
													var d = format.news(historyData, profile, de);
													Generalfunc.response(200,d, function(response){
														res.json(response);
													});
												});
											}
										}
									});
								});	
							}else{
								save_news(profileData, titulo, contenido, [], function(historyData){
									res.json(historyData);
								});
							}	
						}
						
					}else{
						res.send("No Profile");

						Generalfunc.response(113, {}, function(response){
							res.json(response);
						});
					}
				});
			}else{
				Generalfunc.response(101, {}, function(response){
					res.json(response);
				});
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
router.post('/get/news/a', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				Networkfunc.getFriends(profileData._id, function(errFriends, friendsData, friendsId){
					console.log(friendsId);
					var friends = friendsId;
					friends.push(profileData._id);

					var search = new Object();
					search.profile_id = { "$in": friends }
					search.action = { "$in": ["1","2","3","6","7"]}


					var r = model.history.find( search );
					var data = [];

					console.log(search);
					
					r.sort( [ ['createdAt', 'descending'] ] ).populate('profile_id').populate('de_id').exec(function(errHistory,historyData){
						if(historyData.length > 0){
							_.each(historyData, function(element, index, list) {
								var d = format.news(element, element.profile_id, element.de_id);
								data.push(d);
	    						if(index+1 == historyData.length) {
	    							Generalfunc.response(200, data, function(response){
	    								res.json(response);
	    							});
	    						}
							});
						}else{
							Generalfunc.response(200, {}, function(response){
								res.json(response);
							})
						}
					});
					
					
				});
			});
		}else{

		}
	});
});
router.post('/get/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var max       = req.body.max;
	var page      = req.body.page;
	var action    = req.body.action;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				Networkfunc.getFriends(profileData._id, function(errFriends, friendsData, friendsId){
					var friends = friendsId;
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
					var r = model.history.find( search );
					var data = [];
					/*
					if(typeof max != "undefined"){
						max = max*1;
						r = r.limit(max);
					}else{
						r = r.limit(40);
					}
					*/
					if(typeof page != "undefined"){
						page = page*1;
						page = page-1;
						var pages = page*max;
						r = r.skip(pages);
					}
					var data = [];
					r.sort( [ ['createdAt', 'descending'] ] ).populate('profile_id').populate('de_id').exec(function(errHistory,historyData){
						if(historyData.length > 0){
							_.each(historyData, function(element, index, list) {
								var d = format.news(element, element.profile_id, element.de_id);
								data.push(d);
	    						if(index+1 == historyData.length) {
	    							Generalfunc.response(200, data, function(response){
	    								res.json(response);
	    							});
	    						}
							});
						}else{
							Generalfunc.response(200, {}, function(response){
								res.json(response);
							})
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
