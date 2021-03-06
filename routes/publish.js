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
	var Notificationfunc    = require('../functions/notificationfunc');
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

/**
 * Route "/write/comentario", Insertando Feedback.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} content, Comentario a insertar.
 * @return {FeedbackObject}
 *
 */
router.post('/write/comentario', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var contenido = req.body.content;
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){

				var feedback = new Feedback({
					profile_id: profileData._id,
					content: contenido
				});
				feedback.save(function(errFeedback, feedbackData){
					var from_name = "";
					if((profileData.first_name != undefined) || (profileData.last_name)){
						from_name = profileData.first_name + " " + profileData.last_name;
					}
					var speciality = "";
					if(profileData.speciality != undefined){
						if(profileData.speciality.name != undefined){
							speciality = profileData.speciality.name;
						}	
					}
					var email_content = '<div style="background-color: #f2f2f2;color: #232121;font-weight: 300;font-size: 15px;padding: 10px;margin-top:10px;"> <div style="width:110px;margin:0 auto;"> <div style="display: block; font-size: 16px; color: #232121; font-weight: 300; ">'+from_name+'</div> <div style="display: block; font-size: 14px; color: #f7a700; font-weight: 300;">'+speciality+'</div> </div> '+contenido+'</div>';
					Generalfunc.sendEmail("email_generico_html.jade", {
						title: "Comentario de:",
						content: email_content
					}, "esteban@thehiveapp.mx", "Comentario TheHive",function(status, html){
						Generalfunc.response(200, format.feedback(feedbackData), function(response){
							res.json(response);
						});
					});

				});

			});
		}else{
		}
	});
});
/**
 * save_news, Guardar Noticia. Se usa en la ruta para crear Noticias.
 * @param {ProfileObject} profileData, 
 * @param {String} title, Titulo de la noticia. (***)
 * @param {String} content, Texto a guardar en la noticia.
 * @param {Array} gallery, arreglo con el nombre de las imagenes.
 * @param {function} callback.
 * @return {HistoryObject}
 *
 */
function save_news(profileData, title, content, gallery,callback){
	if(gallery == null){
		gallery = [];
	}
	var h = {
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
};
/**
 * update_news, Guardar Noticia. Se usa en la ruta para crear Noticias.
 * @param {ObjectId} id. 
 * @param {ProfileObject} profileData.
 * @param {String} title, Titulo de la noticia. (***)
 * @param {String} content, Texto a guardar en la noticia.
 * @param {Array} gallery, arreglo con el nombre de las imagenes.
 * @param {function} callback.
 * @return {HistoryObject}
 *
 */
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
/**
 * Route "/write/news", Insertando una Noticia.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} title, Titulo de la noticia. (***)
 * @param {String} content, Comentario a insertar.
 * @param {Array} gallery, arreglo con el nombre de las imagenes.
 * @return {HistoryObject}
 *
 */
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
										var file_pic  = shortid.generate() + "." + extension;

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
							//
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
/**
 * Route "/write/news", Insertando una Noticia sin Imagenes.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} title, Titulo de la noticia. (***)
 * @param {String} content, Comentario a insertar.
 * @return {HistoryObject}
 *
 */
router.post('/write/news/loi', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var titulo    = req.body.title;
	var contenido = req.body.content;
	var data = [];

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
/**
 * Route "/write/news/image", Insertando imagenes en una noticia.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} title, Titulo de la noticia. (***)
 * @param {String} content, Comentario a insertar.
 * @return {HistoryObject}
 *
 */
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
							var extension = mime.extension(item.type);
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

										//
										
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
/**
 * Route "/get/news", Obtener Noticias.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} max, Maximo numero de noticias por pagina.
 * @param {String} page, Pagina a consultar.
 * @param {String} action, Tipo de Noticia a consultar.
 * @return {[HistoryObject]}
 *
 */
router.post('/get/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var max       = req.body.max;
	var page      = req.body.page;
	var action    = req.body.action;
	var pages     = 0;

	if(Generalfunc.isNumber(max)){
		max = max*1;
	}else{
		max = 20;
	}
	if(Generalfunc.isNumber(page)){
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
					search.action = { "$in": ["1","2","3","4","5","6","7"]}

					

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
/**
 * Route "/get/news", Obtener Noticias de un Perfil.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} max, Maximo numero de noticias por pagina.
 * @param {String} page, Pagina a consultar.
 * @param {String} action, Tipo de Noticia a consultar.
 * @param {String} public_id, ID del perfil.
 * @return {[HistoryObject]}
 *
 */
router.post('/get/news/friend', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var max       = req.body.max;
	var page      = req.body.page;
	var action    = req.body.action;
	var pages     = 0;
	var public_id = req.body.public_id;

	if(Generalfunc.isNumber(max)){
		max = max*1;
	}else{
		max = 20;
	}
	if(Generalfunc.isNumber(page)){
		pages = page*1;
		pages = (pages*max);
	}else{
		pages = 0;
	}


	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(mongoose.Types.ObjectId.isValid(public_id)){
					public_id = mongoose.Types.ObjectId(public_id);

					Profile.findOne({ public_id: public_id }).exec(function(err, profileData){
						Networkfunc.getFriends(profileData._id, function(errFriends, friendsData, friendsId){
							var friends = friendsId;
							friends.push(profileData._id);

							var search = new Object();
							search.profile_id = { "$in": friends }
							search.action = { "$in": ["1","2","3","4","6","7"]}

							

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
/**
 * Route "//delete/news", Eliminar una noticia.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} id, ID de la Noticia.
 * @return {[HistoryObject]}
 *
 */
router.post('/delete/news', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.id;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				if(mongoose.Types.ObjectId.isValid(id)){
					History.findOne({ _id: id  }).exec(function(err, historyData){
						if(profileData._id.toString() == historyData.profile_id.toString()){
							historyData.remove(function(err){
								if(!err){
									Generalfunc.response(200, {
										deleted: true,
										history: historyData
									}, function(response){
										res.json(response);
									});
								}else{
									Generalfunc.response(101, {},function(response){
										res.json(response);
									})
								}
								
							});
						}else{
							Generalfunc.response(101, {},function(response){
								res.json(response);
							})
						}
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
/**
 * Route "/get/news/show", Mostrar una Noticia.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} id, ID de la Noticia.
 * @return {HistoryObject}
 *
 */
router.post('/get/news/show', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var news_id   = req.body.id;


	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				console.log("History:");
				console.log( news_id );
				History.findOne({ _id: news_id }).populate('profile_id').populate('de_id').exec(function(errHistory,historyData){
					console.log( historyData );
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
/**
 * Route "/update/news", Actualizar una Noticia.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} id, ID de la Noticia.
 * @param {String} title,  Titulo nuevo de la noticia. (***)
 * @param {String} content, Texto nuevo de la Noticia.
 * @param {Array} gallery, Conjunto de Imagenes.
 * @return {HistoryObject}
 *
 */
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
							//
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

/**
 * Route "/get/review", Obtener las Reseñas.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, Public Id de otro Perfil. Si quieres obtenerlas de otro perfil.(Opcional)
 * @param {String} max, Maximo numero de noticias por pagina.(Opcional)
 * @param {String} page, Pagina a consultar.(Opcional)
 * @return {ReviewObject}
 *
 */
router.post('/get/review', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var public_id = req.body.public_id;
	var max       = req.body.max;
	var page      = req.body.page;
	var pages     = 1;

	max = (Generalfunc.isNumber(max))?max*1:20;
	pages = (Generalfunc.isNumber(page))?((page*1)*max):0;

	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
				console.log("Token");

				if(public_id != undefined){
					console.log("PublicId Check");
					Profilefunc.publicId(public_id, function(statusPublic, publicProfileData){
						if(statusPublic){
							var data = {
								"profile_id": publicProfileData._id
							};
							var r = Review.find( data );
							r = r.sort( [ ['createdAt', 'descending'] ] );
							r = r.limit(max);
							//
							r = r.skip(pages);
							//r = r.populate('profile_id');
							console.log("PublicId");
							r.populate('profiles').exec(function(errReview, reviewData){
								r.exec(function(errReview, reviewData){
									Generalfunc.review_check(profileData, publicProfileData, function(review_allow, review_date_plus, review_date){
										Networkfunc.isFriend(profileData._id, publicProfileData._id, function(status){
											console.log("Network");
											if(reviewData.length > 0){
												async.map(reviewData, function(item,cb){
													console.log("Review[]");
													var i = {
														_id: item._id,
														updatedAt: item.updatedAt,
														createdAt: item.createdAt,
														title: item.title,
														content: item.content,
														rate: item.rate,
														profiles: [
														Profilefunc.compactformat( item.profiles[0] )
														]
													};
													cb(null, i );
												}, function(err, results){
													console.log("Results");
													var a = {
														"profile": Profilefunc.compactformat( publicProfileData ),
														"isFriend": status,
														"review": results,
														"review_allow": {
															allow: review_allow,
															date_plus: review_date_plus.toString(),
															date: review_date.toString()
														}
													};
													console.log( a );
													Generalfunc.response(200, a, function(response){
														res.json(response);
													});
												});
											}else{
												console.log("No Reviews");
												var a = {
													"profile": Profilefunc.compactformat( publicProfileData ),
													"isFriend": status,
													"review": reviewData,
													"review_allow": {
														allow: review_allow,
														date_plus: review_date_plus.toString(),
														date: review_date.toString()
													}
												};

												console.log( a );
												Generalfunc.response(200, a, function(response){
													res.json(response);
												});
											}
											
											
										});
									});
								});
							});	
						}else{
							Generalfunc.response(101, {},function(response){
								res.json(response);
							})
						}
					});
				}else{
					var data = {
						"profile_id": profileData._id,
					};
					var r = Review.find(data);
					r = r.sort( [ ['createdAt', 'descending'] ] );
					r = r.limit(max);
					//
					r = r.skip(pages);
					r.populate('profiles').exec(function(errReview, reviewData){
						r.exec(function(errReview, reviewData){
							var a = {
								"review": reviewData,
								"review_allow": {
									allow: false
								}
							};
							Generalfunc.response(200, a, function(response){
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
/**
 * Route "/write/review", Escribir una Reseña.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, Public Id de otro Perfil.
 * @param {String} title, Titulo de la Reseña.
 * @param {String} content, Contenido de la Reseña.
 * @param {String} score, Calificación de la Reseña.
 * @return {ReviewObject}
 *
 */
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
									if(reviewCheck == 1){
										Historyfunc.insert({
											profile_id: publicProfileData._id,
											de_id: profileData._id,
											action: "3",
											data: {}
										}, function(errHistory, historyData){
											var suma  = 0;
											var count = 0;

											Review.find({ profile_id: publicProfileData._id }).exec(function(err, review){
												review.forEach(function(item, index){
													if(Generalfunc.isNumber(item.rate)){
														suma+= item.rate;
														count++;
													}

													if((review.length-1) == index){
														var prom = suma/count;

															//
															publicProfileData.review_score = prom;
															publicProfileData.save(function(err, profile){
																Profile.find({ _id: publicProfileData._id }).exec(function(err, NprofileData){
																	Review.findOne({ _id: reviewData._id }).populate('profiles').populate('profile_id').exec(function(err, reviewData){
																		
																		console.log()
																		Notificationfunc.add({
																			tipo: 5,
																			profile: publicProfileData._id,
																			profile_emisor: profileData._id,
																			
																			review: reviewData._id,

																			clicked: false,
																			status: false,
																		}, function(status, notificationData){

																			Generalfunc.response(200, reviewData, function(response){
																				res.json(response);
																			});

																		}, req.app.io);

																		
																	});
																});
															})
														}
													});
											});

										});
									}else{
										var suma  = 0;
										var count = 0;

										Review.find({ profile_id: publicProfileData._id }).exec(function(err, review){

											async.map(review, function(item, callback){
												if(Generalfunc.isNumber(item.rate)){
													suma+= item.rate;
													count++;
												}
												callback(null, item);
											}, function(err, results){
												var prom = suma/count;

												
												publicProfileData.review_score = prom;
												publicProfileData.save(function(err, profile){
													Profile.find({ _id: publicProfileData._id }).exec(function(err, NprofileData){
														Review.findOne({ _id: reviewData._id }).populate('profiles').populate('profile_id').exec(function(err, reviewData){



															Notificationfunc.add({
																tipo: 5,
																profile: publicProfileData._id,
																profile_emisor: profileData._id,

																review: reviewData._id,

																clicked: false,
																status: false,
															}, function(status, notificationData){

																Generalfunc.response(200, reviewData, function(response){
																	res.json(response);
																});
																
															}, req.app.io);
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
				});
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/count/review", Obtener los datos de las Reseñas de un Perfil.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} public_id, Public Id de otro Perfil.
 * @return {Object} { avg, sum, count, data }
 *
 */
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
/**
 * Route "/write/recomendar", Crear Recomendación.
 * @param {String} guid, Token del Perfil(permiso).
 * @param {String} busqueda, Busqueda para la que pides una recomendación.
 * @return {HistoryObject}.
 *
 */
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