	var express = require('express');
	var router = express.Router();
	var path = require('path');
	var fs = require('fs');
	var mongoose   = require('mongoose');
	var _ = require('underscore');
	var async = require('async');
	var mime = require('mime-types');
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

	var model = require('../model');
	var Profile     = model.profile;
	var User        = model.user;
	var Token       = model.token;
	var Job         = model.job;
	var Company     = model.company;
	var Experience  = model.experience;
	var Network     = model.network;
	var History     = model.history;
	var Feedback    = model.feedback;
	var Review      = model.review;
	var Log         = model.log;
	var Skill       = model.skill;
	var Speciality  = model.speciality;
	var Sector      = model.sector;
	var Notification = model.notification;
	var Feedback     = model.feedback;
	var Conversation = model.conversation;
	var Message      = model.message;
	var City         = model.city;
	var State        = model.state;
	var Country      = model.country;

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
	if(gallery == null){
		gallery = [];
	}
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
function update_news(id, profileData, title, content, gallery,callback){
	if(gallery == null){
		gallery = [];
	}
	var h = {
		title: title,
		content: content,
		gallery: gallery
	};


	History.findOne({ _id: id }).exec(function(err, history){
		
		history.data = h;
		history.save(function(errHistory, historyData){
			callback(errHistory, historyData);
		});
	});
}
router.post('/write/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var titulo    = req.body.title;
	var contenido = req.body.content;
	var gallery   = req.files.gallery;
	var data = [];

	console.log(req.body);
	console.log(req.files);


	Tokenfunc.exist(guid, function(status, tokenData){

		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){

					async.series([
						function(callback){
							if(typeof gallery != "undefined"){
								if(gallery.constructor === Array){
									gallery.forEach(function(item, index){
										var file = item;
										var objectId  = new ObjectID();
										var fileName  = file.fieldName;
										var pathfile  = file.path;
										var extension = mime.extension(item.type);
										var file_pic  = shortid.generate() + extension;

										var new_path = path.dirname(path.dirname(process.mainModule.filename)) + '/public/gallery/' + file_pic;
										fs.rename(pathfile, new_path, function(err){
											if (err){
												throw err;
											}else{
												var p = file_pic;
												data.push({url: p});

												if(index == (gallery.length-1)){
													callback(null, data);
												}
											}
										});
									});	
								}
								
							}else{
								callback(null, {});
							}
						}
						], function(err, results){
							console.log(results);
							var data = {};
							if(typeof results[0] != "undefined"){
								data = results[0];
							}
							save_news(profileData, titulo, contenido, data, function(historyData){
								res.json(historyData);
							});

						});



				}else{
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
router.post('/write/news/loi', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var titulo    = req.body.title;
	var contenido = req.body.content;
	var data = [];

	console.log(req.body);
	console.log(req.files);
	

	Tokenfunc.exist(guid, function(status, tokenData){

		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){

					save_news(profileData, titulo, contenido, undefined, function(historyData){
						res.json(historyData);
					});

				}else{
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
router.post('/write/news/image', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var history   = req.body.id;
	var images     = req.files;
	var data = [];

	if(mongoose.Types.ObjectId.isValid(history)){
		history = mongoose.Types.ObjectId(history);
	}
	
	if(images.image != undefined){
		var image = images.image;
		Tokenfunc.exist(guid, function(status, tokenData){

			if(status){
				Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
					if(status){
						if(image != undefined){
							var file = image;
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


									History.findOne({ _id: history }).exec(function(errHistory, historyData){

										data = data.concat(historyData.data.gallery);
										data.push({ "url" : p });
										historyData.data.gallery = data;

										console.log(historyData);
										
										historyData.save(function(err, history){
											History.findOne({ _id: history._id }).exec(function(errHistory, historyData){
												Generalfunc.response(200, historyData, function(response){
													res.json(response);
												});
											});
										});
									});
								}
							});
						}else{
							Generalfunc.response(101, {}, function(response){
								res.json(response);
							});
						}
					}else{
						Generalfunc.response(101, {}, function(response){
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
	}else{
		Generalfunc.response(101, { error: "No image" }, function(response){
			res.json(response);
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
	var pages     = 0;

	if(isNumber(max)){
		max = max*1;
	}else{
		max = 20;
	}
	if(isNumber(page)){
		pages = page*1;
		pages = (pages*max);
	}else{
		pages = 0;
	}


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
							action = actTemp;
						}
						search.action = { "$in": action }
					}
					var r = model.history.find( search );
					var data = [];
					
					r = r.limit(max);
					r = r.skip(pages);
					
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
			Generalfunc.response(101, {},function(response){
				res.json(response);
			})
		}
	});
});
router.post('/get/news/show', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var news_id   = req.body.id;


	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){

				History.findOne({ _id: news_id }).populate('profile_id').populate('de_id').exec(function(errHistory,historyData){

					var d = format.news(historyData, historyData.profile_id, historyData.de_id);
					Generalfunc.response(200, d, function(response){
						res.json(response);
					});
				});
			});
		}else{
			Generalfunc.response(101, {},function(response){
				res.json(response);
			})
		}
	});
});
router.post('/update/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.id;
	var titulo    = req.body.title;
	var contenido = req.body.content;
	var gallery   = req.files.gallery;
	var data = [];

	
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId(id);
	}


	Tokenfunc.exist(guid, function(status, tokenData){

		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){

					async.series([
						function(callback){
							if(typeof gallery != "undefined"){
								if(gallery.constructor === Array){
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
													callback(null, data);
												}
											}
										});
									});	
								}
								
							}else{
								callback(null, {});
							}
						}
						], function(err, results){
							console.log(results);
							var data = {};
							if(typeof results[0] != "undefined"){
								data = results[0];
							}


							update_news(id, profileData, titulo, contenido, data, function(historyData){
								res.json(historyData);
							});

						});



				}else{
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
// GET REVIEW
// Parameter
//  	Token
// 		Max (Opcional) Maximo 40
// 		Page(Opcional)
// Return (Formato 1)
// 		News
router.post('/get/review', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var public_id = req.body.public_id;
	var max       = req.body.max;
	var page      = req.body.page;
	var pages     = 1;

	console.log(page);
	console.log(max);

	if(isNumber(max)){
		console.log("Max is Number");
		max = max*1;
	}else{
		max = 20;
	}
	if(isNumber(page)){
		console.log("Page is Number");
		pages = page*1;
		pages = (pages*max);
	}else{
		pages = 0;
	}

	
	
	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(public_id != undefined){
					Profilefunc.publicId(public_id, function(statusPublic, publicProfileData){
						if(statusPublic){
							var data = publicProfileData._id;

							var d = {
								profile_id: data

							};
							/*
							var d = {
								profiles: {
									"$in": [data]
								}
							};
							*/
							var r = Review.find(d);
							r = r.sort( [ ['createdAt', 'descending'] ] );
							r = r.limit(max);
							console.log("Pages:"+pages);
							r = r.skip(pages);
							r = r.populate('profile_id');
							r.populate('profiles').exec(function(errReview, reviewData){
								r.exec(function(errReview, reviewData){
									Generalfunc.response(200, reviewData, function(response){
										res.json(response);
									});
								});
							});	
						}
					});
				}else{
					var data = profileData._id;

					var r = Review.find({
						profiles: {
							"$in": [data]
						}
					});
					r = r.sort( [ ['createdAt', 'descending'] ] );
					r = r.limit(max);
					console.log("Pages:"+pages);
					r = r.skip(pages);
					r = r.populate('profile_id');
					r.populate('profiles').exec(function(errReview, reviewData){
						r.exec(function(errReview, reviewData){
							Generalfunc.response(200, reviewData, function(response){
								res.json(response);
							});
						});
					});
				}
				
				

			});
		}else{
			Generalfunc.response(101, {},function(response){
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

						Historyfunc.insert({
							profile_id: publicProfileData._id,
							de_id: profileData._id,
							action: "7",
							data: {
								content: content,
								title: title,
								rate:  score
							}
						}, function(errHistory, historyData){

							review.save(function(errReview, reviewData){
								Review.count({
									profiles:{
										"$all":[publicProfileData._id,profileData._id]
									}
								},function(errReview, reviewCheck){
									console.log("Review Count:");
									console.log(reviewCheck);
									if(reviewCheck == 1){
										console.log("Primer Review");
										Historyfunc.insert({
											profile_id: publicProfileData._id,
											de_id: profileData._id,
											action: "3",
											data: {}
										}, function(errHistory, historyData){
											console.log("History!!");
											//Review.find({ _id: reviewData._id }).populate('profiles').populate('profile_id').exec(function(errReview, reviewData){
											var suma  = 0;
											var count = 0;

											Review.find({ profile_id: publicProfileData._id }).exec(function(err, review){
												console.log(review);
												review.forEach(function(item, index){
													suma+= item.rate;
													count++;

													if((review.length-1) == index){
														var prom = suma/count;
														profileData.review_score = prom;
														profileData.save(function(err, profile){
															Profile.find({ _id: profile._id }).exec(function(err, profileData){
																Review.findOne({ _id: reviewData._id }).populate('profiles').populate('profile_id').exec(function(err, reviewData){
																	Generalfunc.response(200, reviewData, function(response){
																		res.json(response);
																	});
																});
															});
														})
													}
												});
												


											});
											
										});
									}else{
										console.log("No es Primer Review");
										//Review.find({ _id: reviewData._id }).populate('profiles').populate('profile_id').exec(function(errReview, reviewData){
										var suma  = 0;
											var count = 0;

											Review.find({ profile_id: publicProfileData._id }).exec(function(err, review){
												console.log(review);

												async.map(review, function(item, callback){
													suma+= item.rate;
													count++;
													callback(null, item);
												}, function(err, results){
													var prom = suma/count;
														profileData.review_score = prom;
														profileData.save(function(err, profile){
															Profile.find({ _id: profile._id }).exec(function(err, profileData){
																Review.findOne({ _id: reviewData._id }).populate('profiles').populate('profile_id').exec(function(err, reviewData){
																	Generalfunc.response(200, reviewData, function(response){
																		res.json(response);
																	});
																});
															});
														});
												});												

											});
									}
								});
								
							});
						});
						

						
					}else{
						Generalfunc.response(101, {"message": "publicNotFound"}, function(response){
							res.json(response);
						});
					}
					
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
router.post('/count/review', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var public_id = req.body.public_id;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				Profilefunc.publicId(public_id, function(statusPublic, publicProfileData){
					if(statusPublic){

						Review.find({ profile_id: profileData._id }).exec(function(err, reviewData){
							res.json(reviewData);
						})
					}else{
						var suma  = 0;
						var count = 0;
						var find = Review.find({ profile_id: profileData._id });
						var data = [];
						find.exec(function(err, reviewData){
							reviewData.forEach(function(item, index){
								suma+= item.rate;
								count++;
								data[data.length] = item.rate;
								if((reviewData.length-1) == index){	
									var prom = suma/count;
									res.json({
										avg: prom,
										sum: suma,
										count: count,
										data: data
									});
								}
								
							});
						})
					}
				});
			});
		}else{
			Generalfunc.response(101, { message: "No Token" }, function(response){
							res.json(response);
						});
		}
	});
});
router.post('/write/recomendar', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var busqueda  = req.body.busqueda;
	var data = [];

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(status){
					Historyfunc.insert({
						profile_id: profileData._id,
						action: 4,
						data: {
							busqueda: busqueda
						}
					}, function(err, historyData){
						var profile = format.littleProfile(profileData);
						var d = format.news(historyData, profile, {});
						Generalfunc.response(200,d, function(response){
							res.json(response);
						});
					});
				}else{
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
module.exports = router;

function extension(mime){

}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}