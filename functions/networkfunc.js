/**
 * Helpers de Conexiones de Perfiles.
 *
 * @module Helpers
 */
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Generalfunc = require('./generalfunc');

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

var Tokenfunc        = require('./tokenfunc');
var Notificationfunc = require('./notificationfunc');


/**
 * addReview(***)
 *
 */
function addReview(profile_id_a, public_id, callback){}
/**
 * addNetwork(***)
 *
 */
function addNetwork(profile_id_a, public_id, callback){}
/**
 * connectCheck, Buscamos sobre una query, en la coleccion de amigos.
 *
 * @param {String} find, query a buscar en la colección de Amigos.
 * @param {function} success, Callback todo bien.
 * @param {function} fail, Callback Error.
 * @callback {success|fail}
 *
 */
function connectCheck(find, success, fail){
	Network.findOne(find).exec(function(err, networkData){
		Notification.find({
			network: networkData
		}).exec(function(errorNotification, notificationData){
			if(!err && networkData){
				success(networkData);
			}else{
				fail(err);
			}
		});
	});
}
/**
 * message, Crear un Mensaje.
 *
 * @param {Object} profileData, Data de Perfil.
 * @param {ObjectId} conv, ID de Conversacion.
 * @param {String} text, texto para crear Mensaje.
 * @param {function} callback
 * @callback {Bool,MessageObject}
 *
 */
function message(profileData, conv, text, callback){
	Conversation.findOne({ _id: conv }).exec(function(errConversation, conversationData){
		if(!errConversation && conversationData){
			var message = new Message({
				profile_id: profileData._id,
				conversation: conversationData._id,
				message: text
			});

			message.save(function(errMessage, messageData){
				if(!errMessage && messageData){
					callback(true, messageData);
				}else{
					callback(false);
				}
			});
		}else{
			callback(false);
		}
	});
}
/**
 * otherProfile, Dividir Perfiles de una Arreglo.(***) Esto ya lo tiene Generalfunc.
 *
 * @param {Object} profiles, Arreglo de Perfiles.
 * @param {ObjectId} profile_id, Perfil a buscar dentro del Arreglo.
 * @param {function} cb, Callback.
 * @callback {function}
 *
 */
function otherProfile(profiles, profile_id,cb){
	var a = "";
	profiles.forEach(function(item, index){
		var i = trimUnderscores(item.toString());
		var p = trimUnderscores(profile_id.toString());
		if(i != p){
			a = i;
		}
		if(index == (profiles.length-1)){
			cb(a);
		}
	})
}

/**
 * checkconversation, Obtener Conversacion entre dos personas, si no existe crearla.
 *
 * @param {Object} profile_a, Primer Perfil.
 * @param {ObjectId} profile_b, Segundo Perfil.
 * @param {function} callback
 * @callback {function}
 *
 */
function checkconversation(profile_a, profile_b, callback){

	var generated_id_a = mongoose.Types.ObjectId( profile_a );
	var generated_id_b = mongoose.Types.ObjectId( profile_b );

	var profile = [generated_id_a, generated_id_b];

	Conversation.find({
		profiles: {
			"$in" : profile
		}
	}, function(err, conversationData){
		
		if(!err && conversationData){

			if(conversationData.length > 0){
				callback(true, conversationData);
			}else{
				var conversation = new Conversation({
					profiles: profile,
					status: "active",
					message: []
				});
				conversation.save(function(err, conversationData){
					callback(false, conversationData);
				});
			}
		}
	});
}
/**
 * PublicId, Obtener el Perfil buscando por su public_id
 *
 * @param {ObjectId} public_id, Public_id del Perfil.
 * @param {function} callback
 * @callback {function}
 *
 */
function PublicId(public_id, callback){
	
	
	Profile.findOne({ public_id: public_id}).exec(function(errProfile, profileData){
		
		
		if(!errProfile && profileData){
			
			

			callback(true, profileData);
		}else{
			callback(false,{});
		}
	});
}
/**
 * getListFriends, Obtener la lista de Amigos de cierto Perfil.(***) La funcion de abajo es la que se usa.
 *
 * @param {ObjectId} profile_id, Perfil a buscar.
 * @param {function} callback
 * @callback {function}
 *
 */
function getListFriends(profile_id,callback){
	if(typeof profile_id == "object"){
		var profile_id = mongoose.Types.ObjectId(profile_id);	
	}
	var data = [];
	Network.find({
		"profiles": {
			"$in": [profile_id]
		},
		"accepted": true
	}).exec(function(errNetwork, networkData){		
		if(networkData.length > 0){
			networkData.forEach(function(friend, index, friends){

				var a = friend.profiles.filter(function(o){
					return o.toString() != profile_id.toString() 
				});
				a = a[0];
				
				
				
			});
		}else{
			callback(errNetwork, {}, []);
		}
		
		
	});
}
/**
 * getListFriends, Obtener la lista de Amigos de cierto Perfil.
 *
 * @param {ObjectId} profile_id, Perfil a buscar.
 * @param {function} callback
 * @callback {function}
 *
 */
function getFriends(profile_id,callback){
	if(typeof profile_id == "object"){
		var profile_id = mongoose.Types.ObjectId(profile_id);	
	}
	var data = [];
	Network.find({
		"profiles": {
			"$in": [profile_id]
		},
		"accepted": true
	}).exec(function(errNetwork, networkData){		
		if(networkData.length > 0){
			networkData.forEach(function(friend, index, friends){

				var a = friend.profiles.filter(function(o){
					return o.toString() != profile_id.toString() 
				});
				a = a[0];
				
				data.push(a);

				if((networkData.length-1) == index){
					callback(errNetwork, friends, data);
				}
				
			});
		}else{
			callback(errNetwork, {}, []);
		}
		
		
	});
}
/**
 * getNoMyID (***)
 *
 */
function getNoMyID(profilesId, profile_id){
	var a = profilesId.filter(function(o){
		return o.toString() != profile_id.toString()
	});
	return a;
}
/**
 * isNeightbor, Revisar si el "profile_id" y "another_id" son vecinos.
 * @param {ProfileObject} profile_id, Perfil a buscar.
 * @param {ProfileObject} another_id, Perfil a Encontrar.
 * @param {function} callback
 * @callback {type} 0 = No Amigo, No Vecino | 2 = No Amigo, Vecino | 1 = Amigo
 *
 */
function isNeightbor(profile_id, another_id, callback){
	var lvl = 0;

	getFriends(profile_id._id, function(errFirst, firstData, firstIds){
		if(firstIds.length>0){
			firstIds.forEach(function(firstItem, firstIndex){
				getFriends(firstItem, function(errSecond, secondData, secondIds){

					var x = secondIds.filter(function(y){
						return y.toString() == another_id._id.toString()
					});
					if(x.length > 0){
						lvl = 1;
					}
					if(firstIndex+1 == firstIds.length){
						if(lvl == 1){
							callback(1, firstItem);
						}else{
							callback(2);
						}
					}
				});
			});
			
		}else{
			callback(0);
		}
	});
}
/**
 * isFriend, Revisar si el "profile_id" y "another_id" son amigos.
 * @param {ProfileObject} profile_id, Perfil a buscar.
 * @param {ProfileObject} another_id, Perfil a Encontrar.
 * @param {function} callback
 * @callback {Bool}
 *
 */
function isFriend(profile_id, another_id, callback){
	var d = {
		"profiles": {
			"$all": [profile_id, another_id]
		},
		"accepted": true
	};
	
	Network.findOne(d).exec(function(errNetwork, networkData){
		if(!errNetwork && networkData){
			if(networkData != null){
				callback(true);
			}else{
				callback(false);
			}
		}else{
			callback(false);
		}
	});	
}
/**
 * typeFriend, Revisar si una solicitud es enviada solamente, o aceptada.
 * @param {ProfileObject} profile_id, Perfil a buscar.
 * @param {ProfileObject} another_id, Perfil a Encontrar.
 * @param {function} callback
 * @callback {Numeric} 2 = Aceptado | 1 = Enviada | 0 = No Solicitud
 *
 */
function typeFriend(profile_id, another_id, callback){
	var d = {
		"profiles": {
			"$all": [profile_id, another_id]
		}
	};
	
	Network.findOne(d).exec(function(errNetwork, networkData){
		if(!errNetwork && networkData){
			if(networkData.accepted == true){
				callback(2);
			}else{
				callback(1);
			}
			
		}else{
			callback(0);
		}
	});	
}
/**
 * type, Revisar las conexiones que existen entre estos usuarios. usamos isNeightbor de mas arriba para hacer el proceso.
 * @param {ProfileObject} profile_id, Perfil a buscar.
 * @param {ProfileObject} another_id, Perfil a Encontrar.
 * @param {function} callback
 * @callback {Numeric}
 *
 */
function type(profileID, anotherID, callback){
	getFriends(anotherID._id, function(errNetwork, friends, friendsId){
		
		var its = friendsId.filter(function(o){
			var a = o.toString();
			var b = profileID._id.toString();

			return a != b
		});
		if(friendsId.length == its.length){
			isNeightbor(profileID, anotherID, function(status, friendId){
				if(status == 1){
					Profile.findOne({ _id: friendId }).exec(function(errP, pData){
						callback(1, pData);
					});
					
				}else{
					callback(2);
				}
			});
		}else{
			callback(0,anotherID);
		}
	});
}
/**
 * getOne2Callback(***)
 *
 */
function getOne2Callback(search, success, fail){

}
/**
 * accept, Aceptar solicitudes de amistad.
 * @param {Query} search, busqueda hecha en Network, por lo general se busca el arreglo de perfiles.
 * @param {function} success
 * @param {function} fail
 * @callback {success|fail}
 *
 */
function accept(search, success, fail){
	Network.findOne(search).exec(function(errNetwork, networkData){
		if(!errNetwork && networkData){
			networkData.accepted = true;
			networkData.save(function(err, network){
				if(!err && network){
					Network.findOne(search).populate('profiles').exec(function(errNetwork, networkData){
						if(!errNetwork && networkData){
							success(networkData);
						}else{
							fail(2);
						}
					});
				}else{
					fail(1);
				}
			});
		}else{
			fail(0);
		}
	});
}
/**
 * accept, Negar una solicitudes de amistad.
 * @param {Query} search, busqueda hecha en Network, por lo general se busca el arreglo de perfiles.
 * @param {function} success
 * @param {function} fail
 * @callback {success|fail}
 *
 */
function ignore(search, success, fail){
	Network.findOne(search).exec(function(errNetwork, networkData){
		if(!errNetwork && networkData){
			networkData.accepted = false;
			networkData.save(function(err, network){
				if(!err && network){
					Network.findOne(search).populate('profiles').exec(function(errNetwork, networkData){
						if(!errNetwork && networkData){
							success(networkData);
						}else{
							fail(2);
						}
					});
				}else{
					fail(1);
				}
			});
		}else{
			fail(0);
		}
	});
}
/**
 * recomendar, Recomendar a alguien, creamos las notificaciones necesarias.
 * @param {Object} data, Datos de la recomendacion.
 * @param {function} success
 * @param {function} fail
 * @callback {success|fail}
 *
 */
function recomendar(data, success, fail){
	var guid          = data.guid;
	var public_id     = data.public_id;
	var p_recomend_id = data.recomendar_id;
	var history_id    = data.history_id;

	var d = {};// Notificación a persona recibe recomendación.
	var e = {};// Notificación a persona recomiendan. 

	if(mongoose.Types.ObjectId.isValid(history_id)){
		history_id        = mongoose.Types.ObjectId(history_id);	
	}
	if(mongoose.Types.ObjectId.isValid(public_id)){
		public_id = mongoose.Types.ObjectId(public_id);
	}
	if(mongoose.Types.ObjectId.isValid(p_recomend_id)){
		p_recomend_id = mongoose.Types.ObjectId(p_recomend_id);
	}
	
	

	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				
				PublicId(public_id, function(statusPublic, profileAnotherData){
					if(statusPublic){
						PublicId(p_recomend_id, function(statusRecomend, profileRecomendData){
							if(statusRecomend){

								d.tipo = 1;

								d.profile         = profileAnotherData._id;
								d.profile_emisor  = profileData._id;
								d.profile_mensaje = profileRecomendData._id;

								e.tipo            = 2;
								e.profile         = profileRecomendData._id;
								e.profile_emisor  = profileData._id;
								e.profile_mensaje = profileAnotherData._id;

								if(mongoose.Types.ObjectId.isValid(history_id)){
									d.busqueda = history_id;
									e.busqueda = history_id;
								}


								create_notificacion_recomendacion(e, function(statusAn, notificationAnData){
									create_notificacion_recomendacion(d, function(status, notificationData){
										
										if(mongoose.Types.ObjectId.isValid(history_id)){
											History.findOne({ _id: history_id}).exec(function(err, historyData){
												
												var data = {
													profile: profileAnotherData._id,
													profile_emisor: profileData,
													profile_mensaje: profileRecomendData,
													busqueda: historyData
												};

												
												success(data, notificationAnData, notificationData);
											});
										}else{
											var data = {
												profile: profileAnotherData,
												profile_emisor: profileData,
												profile_mensaje: profileRecomendData,
											};

											

											success(data, notificationAnData, notificationData);
										}
										
									});
								});
							}else{
								fail();
							}
						});
					}else{
						fail();
					}
				});
			} );
		}else{
			fail();
		}
	});
}
/**
 * create_notificacion_recomendacion, Crea la Notificaciones para la recomendacion
 * @param {Object} data, Datos de la Notificacion.
 * @param {function} callback
 * @param {function} io, Socket (***)
 * @callback {success|fail}
 *
 */
function create_notificacion_recomendacion(data, callback, io){
	Notificationfunc.add(data, function(status, notificationData){
		callback(status, notificationData);
	}, io);
}
/**
 * new_friend, Crea la Notificaciones para la recomendacion
 * @param {Object} profileData, Datos del Perfil 1 a Conectar.
 * @param {Object} profileAnotherData, Datos del Perfil 2 a Conectar.
 * @param {function} success
 * @param {function} fail
 * @callback {success|fail}
 *
 */
function new_friend(profileData, profileAnotherData, success, fail){
	Network.findOne({
		profiles: {
			$all: [ profileData._id, profileAnotherData._id]
		}
	}).exec(function(errNetwork, networkData){
		
		
		
		if(!errNetwork && networkData){
			success(networkData);
		}else{
			var network = new Network({
					accepted: false,
					profiles: [
					profileData._id,
					profileAnotherData._id
					]
				});
				network.save(function(errNetwork, networkData){
					if(!errNetwork && networkData){
						success(networkData);	
					}else{
						fail(0);
					}
					
				});
		}
	});
}
exports.otherProfile                      = otherProfile;
exports.new_friend                        = new_friend;
exports.create_notificacion_recomendacion = create_notificacion_recomendacion;
exports.recomendar                        = recomendar;
exports.accept                            = accept;
exports.ignore                            = ignore;
exports.getOne2Callback                   = getOne2Callback;
exports.type                              = type;
exports.isNeightbor                       = isNeightbor;
exports.isFriend                          = isFriend;
exports.typeFriend                        = typeFriend;
exports.PublicId                          = PublicId;
exports.getFriends                        = getFriends;
exports.getListFriends                    = getListFriends;
exports.checkconversation                 = checkconversation;
exports.message                           = message;
exports.addReview                         = addReview;
exports.addNetwork                        = addNetwork;

/**
 * trimUnderscores, Eliminar espacios.
 * @param {String} string, Texto a procesar.
 * @return {String}
 *
 */
function trimUnderscores(string) {
    return string.split(' ').join('');
}
/**
 * cleanArray, Esta funcion ya esta siendo usada de Generalfunc.(***)
 */
function cleanArray(actual) {
	var newArray = new Array();
	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}
	return newArray;
}