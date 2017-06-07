/**
 * Helpers de Notificaciones.
 *
 * @module Helpers
 */
var mongoose    = require('mongoose');
var path        = require('path');
var fs          = require('fs');
var _           = require('underscore');
var async       = require('async');

var socket_io    = require('socket.io');
var io           = socket_io();

var format       = require('../functions/format');

var model        = require('../model');
var Profile      = model.profile;
var User         = model.user;
var Token        = model.token;
var Job          = model.job;
var Company      = model.company;
var Experience   = model.experience;
var Network      = model.network;
var History      = model.history;
var Feedback     = model.feedback;
var Review       = model.review;
var Log          = model.log;
var Skill        = model.skill;
var Speciality   = model.speciality;
var Sector       = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Device       = model.device;
var Online       = model.online;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Generalfunc  = require('./generalfunc');
var Pushfunc     = require('./pushfunc');
var APNfunc      = require('./apnfunc');
/**
 * get, Buscar Notificacion.
 * @param {Query} search, Query con que buscar la Notificacion.
 * @param {function} callback
 * @callback {function}
 *
 */
exports.get = function(search, callback){
	model.notification.find(search)
	.populate('profile')
	.populate('profile_emisor')
	.populate('profile_mensaje')
	.populate('busqueda')
	.exec(function(errNotification, notificationData){
		if(!errNotification && notificationData){
			callback(true, notificationData);
		}else{
			callback(false);
		}
	});
};
/**
 * get, Buscar una Notificacion.
 * @param {Query} search, Query con que buscar la Notificacion.
 * @param {function} callback
 * @callback {function}
 *
 */
 function getOne(search, callback){
	model.notification.findOne(search).populate('profile').populate('profile_emisor').populate('profile_mensaje').exec(function(errNotification, notificationData){
		if(!errNotification && notificationData){
			callback(true, notificationData);
		}else{
			callback(false);
		}
	});
};
exports.getOne = getOne;
/**
 * getOne2Callback, Buscar una Notificacion, usando Success y Fail.
 * @param {Query} search, Query con que buscar la Notificacion.
 * @param {function} success.
 * @param {function} fail.
 * @callback {function}
 *
 */
 function getOne2Callback(search, success, fail){
	model.notification.findOne(search)
	.populate('profile')
	.populate('profile_emisor')
	.populate('profile_mensaje')
	.exec(function(errNotification, notificationData){
		if(!errNotification && notificationData){
			success(notificationData);
		}else{
			fail(0);
		}
	});
};
exports.getOne2Callback = getOne2Callback;
/**
 * createOrGet, Buscar un Notificacion si no existe, la crea.
 * @param {Query} search, Query con que buscar la Notificacion.
 * @param {Query} d, Datos para crearla.
 * @param {function} success.
 * @param {function} fail.
 * @callback {function}
 *
 */
exports.createOrGet        = function(search, d, success, fail){
	if(d == null){
		fail();
	}else{
		Notification.findOne(search).exec(function(err, notData){
			if(!err && notData){
				console.log("Existe Notificación");
				if(!notData.status){
					console.log("Status True");
					notData.deleted = false;
					notData.clicked = false;
				}
				notData.save(function(err, notData){
					APNfunc.sendNotification(notData._id, function(){
						success( notData );
					});
				});
			}else{
				console.log("No Existe Notificación");
				var notification = new Notification(d);
				notification.save(function(err, notData){
					APNfunc.sendNotification(notData._id, function(){
						success( notData );
					});
				});
			}
		});
	}
};
/**
 * addOrGet, Buscar un Notificacion si no existe, la crea.
 * @param {Query} search, Query con que buscar la Notificacion.
 * @param {Query} d, Datos para crearla.
 * @param {function} success.
 * @param {function} fail.
 * @callback {function}
 *
 */
exports.addOrGet        = function(search, d, callback){
	if(d == null){
		callback(false);
	}else{
		Notification.findOne(search).exec(function(err, not){
			if(!err && not){
				if(err == null){
					not.status = d.status;
					not.clicked = d.clicked;
					not.save(function(err, notificationData){
						if(!err && notificationData){
							APNfunc.sendNotification(notificationData._id, function(){
								callback(true, notificationData);
							});
						}else{
							callback(false, notificationData);
						}
					});
				}else{
					var notification = new Notification(d);
					notification.save(function(errNotification, notificationData){
						
						
						if(!errNotification && notificationData){
							APNfunc.sendNotification(notificationData._id, function(){
								callback(true, notificationData);
							});
						}else{
							callback(false);
						}
					});
				}
			}else{
				var notification = new Notification(d);
				notification.save(function(errNotification, notificationData){
					
					
					if(!errNotification && notificationData){
						APNfunc.sendNotification(notificationData._id, function(){
							callback(true, notificationData);	
						});
					}else{
						callback(false);
					}
				});
			}
		});
		
	}
};
/**
 * add, Crear Notificacion.
 * @param {Query} d, Datos para crearla.
 * @param {function} callback
 * @callback {function}
 *
 */
exports.add = function(d, callback, io){
	if(d == null){
		callback(false);
	}else{
		var x = {};
		if(d.deleted == undefined){
			x = { deleted: false };
			d = Generalfunc.extend({}, x, d);
		}
		if(d.status == undefined){
			x = { status: false };
			d = Generalfunc.extend({}, x, d);
		}
		if(d.clicked == undefined){
			x = { clicked: false };
			d = Generalfunc.extend({}, x, d);
		}

		var notification = new Notification(d);
		notification.save(function(errNotification, notificationData){

			
			
			if(!errNotification && notificationData){
				APNfunc.sendNotification(notificationData._id, function(){
					send(notificationData._id, function(){
						callback(true, notificationData);	
					},io);
				});
			}else{
				callback(false);
			}
		});
	}
};
/**
 * click, Al Interactuar con una Notificación.
 * @param {Query} search, Datos para buscar la Notificación.
 * @param {Boolean} stat, Estado de la Interaccion. Aceptada = True | Rechazada = False.
 * @param {function} callback
 * @callback {function}
 *
 */
 function click(search, stat, success, fail){
	Notification.findOne(search).exec(function(err,notificationData){
		notificationData.clicked = true;
		notificationData.status  = stat;
		notificationData.save(function(err, not){
			
			
			if(!err && not){
				Notification.findOne(search).exec(function(err,notificationData){
					
					
					if(!err && notificationData){
						success(notificationData);
					}else{
						fail(1);
					}
				});
			}else{
				fail(0);
			}
		});
	});
};
exports.click = click;
/**
 * getOnline.(New)
 *
 */
 function getOnline(ajeno, notificationData, networkData, success){
 	Online.findOne({
 		profiles: ajeno.profile._id
 	}).sort({created_at: -1}).exec(function(errOnline, onlineData){
 		Notification
 		.findOne({ _id: notificationData._id })
 		.select('-__v -updatedAt')
 		.populate('profile')
 		.populate('profile_emisor')
 		.populate('profile_mensaje')
 		.populate('network')
 		.exec(function(err,notificationData){
 			c(onlineData, networkData, notificationData);	
 		});
 	});
 };
exports.getOnline = getOnline;
/**
 * clicked.(New)
 *
 */
function clicked(id, stat,success, fail){
	click({ _id: id },stat, function(notificationData){
		var ajeno = Generalfunc.profile_ajeno_n(profileData._id, networkData.profiles);
		if(stat){
			Notificationfunc.addOrGet({
				tipo: 4,
				profile: notificationData.profile_emisor,
				profile_emisor: notificationData.profile,
				network: networkData._id,
			},{
				tipo: 4,
				profile: notificationData.profile_emisor,
				profile_emisor: notificationData.profile,
				network: networkData._id,
				status: true,
				clicked: true
			}, function(status, newNotData){
				getOne2Callback({ _id: newNotData._id }, function(notNewData){
					getOnline(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
						success(onlineData, networkData, notNData, notificationData);
					});
				}, function(st){
					fail( st );
				});
			});
		}
	});
}
exports.clicked = clicked;
function accept_recomendation(notificationData, stat, success){
	if(stat){
	notificationData.status   = true;
	notificationData.clicked  = true;
	notificationData.save(function(err, notData){
		getOne({
			_id: notData._id
		}, function(notStatus, notificationData){
			Networkfunc.new_friend(notificationData.profile._id, notificationData.profile_mensaje._id, function(networkData){
				var accept_notification = {
					tipo:3,
					profile: notificationData.profile_mensaje._id,
					profile_emisor: notificationData.profile._id,
					network: networkData._id
				};
				console.log( accept_notification );
				
				Notificationfunc.createOrGet(accept_notification, accept_notification, function(status, newNotNetData){
					console.log(status, newNotNetData);
					success( newNotNetData );
				});
			}, function(){
				success( notificationData );
			});
		});
	});
}else{
	notificationData.status   = false;
	notificationData.clicked  = true;
	notificationData.save(function(err, notData){
		getOne({
			_id: notData._id
		}, function(notStatus, notificationData){
			success( notificationData );
		});
	});
}
};
exports.accept_recomendation = accept_recomendation;
function accept_solicitud(notificationData, stat, success){
	var bool_Network = function(networkData){
		click({ _id: id },stat, function(notificationData){

			var ajeno = profile_ajeno(profileData._id, networkData.profiles);


			var a = function(ajeno, notificationData, networkData,c){
				Online.findOne({
					profiles: ajeno.profile._id
				}).sort({created_at: -1}).exec(function(errOnline, onlineData){
					Notification
					.findOne({ _id: notificationData._id })
					.select('-__v -updatedAt')
					.populate('profile')
					.populate('profile_emisor')
					.populate('profile_mensaje')
					.populate('network')
					.exec(function(err,notificationData){
						c(onlineData, networkData, notificationData);	
					});
				});
			};

			if(stat){
				Notificationfunc.addOrGet({
					tipo: 4,
					profile: notificationData.profile_emisor,
					profile_emisor: notificationData.profile,
					network: networkData._id,
				},{
					tipo: 4,
					profile: notificationData.profile_emisor,
					profile_emisor: notificationData.profile,
					network: networkData._id,
					status: true,
					clicked: true
				}, function(status, newNotData){
					getOne2Callback({ _id: newNotData._id }, function(notNewData){
						a(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
							success(onlineData, networkData, notNData, notificationData);
						});
					}, function(st){
						fail( st );
					});
				});
			}else{
				getOne2Callback({ _id: notificationData._id }, function(notNewData){
					a(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
						success(onlineData, networkData, notNData, notificationData);
					});
				}, function(st){
					fail( st );
				});
			}
		}, function(st){
			fail( st );
		});
	};
	if(stat == true){
		Networkfunc.accept({ _id: notificationData.network }, bool_Network, function(st){
			fail(4);
		});
	}else{
		Networkfunc.ignore({ _id: notificationData.network }, bool_Network, function(st){
			fail(4);
		});
	}
};
exports.accept_solicitud = accept_solicitud;
 /**
 * statAndGet, Set Status, Create New Notification and Get Result.
 * @param {NotificationObject} notificationData, Enviar el Push de Notificaciones.
 *
 */
 exports.statAndGet = function(stat, notificationData, success, fail){
 	if(stat){
 		Notificationfunc.addOrGet({
 			tipo: 4,
 			profile: notificationData.profile_emisor,
 			profile_emisor: notificationData.profile,
 			network: networkData._id,
 		},{
 			tipo: 4,
 			profile: notificationData.profile_emisor,
 			profile_emisor: notificationData.profile,
 			network: networkData._id,
 			status: true,
 			clicked: true
 		}, function(status, newNotData){
 			getOne2Callback({ _id: newNotData._id }, function(notNewData){
 				getOnline(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
 					success(onlineData, networkData, notNData, notificationData);
 				});
 			}, function(st){
 				fail( st );
 			});
 		});
 	}else{
 		getOne2Callback({ _id: notificationData._id }, function(notNewData){
 			a(ajeno, notNewData, networkData, function(onlineData, networkData, notNData){
 				success(onlineData, networkData, notNData, notificationData);
 			});
 		}, function(st){
 			fail( st );
 		});
 	}
 }
/**
 * push, Enviar PUSH de Notificaciones. (**)
 * @param {NotificationObject} notificationData, Enviar el Push de Notificaciones.
 *
 */
function push(notificationData){
          if(notificationData != undefined){
          	if(notificationData.profile != undefined){
          		if(notificationData.profile._id != undefined){

          			APNfunc.sendNotification(notificationData._id, function(results){
          				
          			});
          		}
          	}
          }
};
/**
 * send, Send Socket and Push for Notification. (**)
 * @param {ObjectId} id,
 * @param {function} success.
 * @param {Socket} io, 
 * @callback {function}
 *
 */
function send(id, success,io){
	
	Notification.findOne({ _id: id })
	.populate('profile')
	.populate('profile_emisor')
	.populate('profile_mensaje')
	.populate('network')
	.exec(function(errNotification, notificationData){
		APNfunc.get_interfaz().prepare(notificationData.profile._id, notificationData._id, function(profile_id, notification_id){
			APNfunc.addOrGet(1, notification_id, profile_id, function(pushEventData){
				Device.find({ profile: profile_id }).sort({ $natural: -1 }).exec(function(err, deviceData){
					Online.find({ profiles: profile_id }).sort({ $natural: -1 }).exec(function(errOnline, onlineData){
						async.map(onlineData, function(item, callback){
							if(io != undefined){
								if(io.to != undefined){

									io.to(item.socket.toString()).emit('notification', notificationData);
									push(notificationData);
								}else{

								}
							}else{

							}
							callback(null, notificationData);
						}, function(err, result){
							
							
							success();
						});
					});
				});
			}, function(err){
				
				success();
			});
		}, function(profile_id, message_id){
			
			
			success();
		});
	});	
};

exports.send = send;
exports.push = push;