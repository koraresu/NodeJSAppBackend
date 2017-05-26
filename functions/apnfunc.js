/**
 * Test File is a file for testing documenation!
 *
 * @module JSDocTesting
 */
var mongoose    = require('mongoose');
var async       = require('async');
var apn = require('apn');

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
var Country      = model.country;
var City         = model.city;
var Push         = model.push;
var PushEvent    = model.pushevent;


var Generalfunc = require('./generalfunc');
var Interfaz    = require('./interfazpushfunc');
var Tokenfunc   = require('./tokenfunc');
/**
 * get_interfaz, Acceso a el Conjunto de Helpers en INterfazPushFunc
 *
 * @returns {Object}
 *
 */
function get_interfaz(){
	return Interfaz;
};
/**
 * socket_to_profile, Tomamos el Token del socket y obtenemos el Perfil.
 *
 * @param {Object} socket, socket de un usuario online.
 * @param {function} success, Callback todo salga bien.
 * @param {function} fail, Callback Error.
 * @callback {success|fail}
 *
 */
function socket_to_profile(socket, success, fail){
	var guid = socket.guid;

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				success(profileData);
			});
		}else{
			fail();
		}	
	});
}
/**
 * get_sockets, Tomamos el ProfileID y Obtenemos los Sockets/Conexiones al tiempo.
 *
 * @param {Object} profile_id, Perfil a Buscar.
 * @param {function} itemFn, Callback Proceso de cada Elemento.
 * @param {function} resultFn, Callback Proceso al Finalizar los individuales.
 * @callback {success|fail}
 *
 */
function get_sockets(profile_id, itemFn, resultFn ){
	itemFn = (itemFn == undefined)?function(item, callback){ callback(null, item.token);}:itemFn;
	resultFn = (resultFn == undefined)?function(err, results){ }:resultFn;
	Online.find({
		profiles: profile_id
	}).exec(function(errDev, onlineData){
		async.map(onlineData, itemFn, resultFn);
	});
};
/**
 * get_devices, Tomamos el ProfileID y Obtenemos los Dispositivos.
 *
 * @param {Object} profile_id, Perfil a Buscar.
 * @param {function} itemFn, Callback Proceso de cada Elemento.
 * @param {function} resultFn, Callback Proceso al Finalizar los individuales.
 * @callback {success|fail}
 *
 */
function get_devices(profile_id, itemFn, resultFn ){
	itemFn = (itemFn == undefined)?function(item, callback){ callback(null, item.token);}:itemFn;
	resultFn = (resultFn == undefined)?function(err, results){ }:resultFn;
	Device.find({
		profile: profile_id
	}).exec(function(errDev, devData){
		async.map(devData, itemFn, resultFn);
	});
};
/**
 * text_create, Crear Mensajes Para las Notificaciones.
 *
 * @param {String} collection, Nombre de Coleccion.
 * @param {Object} data, Datos de la Coleccion.
 * @return {Object} Json.
 *
 */
function text_create(collection, data ){
	var prof = profile_notification(collection, data);
	if( collection == "notification"){
		return Generalfunc.mensaje_create(data, prof.profile_emisor, prof.profile_mensaje);	
	}else{
		return { mensaje: data.message };
	}
};
/**
 * sendNot, Se envian PUSH, Es una Funcion que obtiene todos los elementos.
 *
 * @param {Object} profile_id, ProfileID
 * @param {Object} title, Mensajes en la Notificacion.
 * @param {Object} payload, Datos anexados a la Notificacion.
 * @param {Object} badge, Numero de Elementos No Leidos en la Notificacion.
 * @param {Object} success, Callback
 * @callback {success}
 *
 */
function sendNot(profile_id, title, payload, badge, success){
	console.log("Send Notification");
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		console.log("Send Notification Valid Profile");
		profile_id = mongoose.Types.ObjectId( profile_id );
		Profile.findOne({
			_id: profile_id
		}).exec(function(errprof, profData){
			console.log("Send Notification Profile Search");
			if(!errprof && profData){
				console.log("Send Notification Profile Search Valid");
				get_devices(profData._id, function(item, cb){
					tokenItem(item.token, function(token){
						cb(null, token );
					});
				}, function(err, results){
					results = Generalfunc.cleanArray( results );
					console.log("Send Notification Get Device", results);
					console.log("Send Notification Num", badge);
					console.log("Send Notification Title", title);
					console.log("Send Notification Payload", payload);

					sendMultiple(function(data){
						console.log("Send Notification sendMultiple", data);
						success( data );
					}, results, title, payload, badge);
				});
			}else{
				success( null );
			}
		});
	}else{
		success(null);
	}
};
/**
 * profile_notification, Genero el ProfileEmisor, y ProfileMensaje para la creacion de los textos de Notificaciones.
 *
 * @param {String} collection, Nombre de Colección.
 * @param {String|Integer} notData, Datos de Notificación.
 * @return {Object} JSON.
 *
 */
function profile_notification(collection, notData){
	if( collection == "notification"){
		var profile_emisor  = "";
		var profile_mensaje = "";
		if(notData.profile_emisor != undefined){
			if(notData.profile_emisor.first_name != undefined){
				profile_emisor = notData.profile_emisor.first_name + " " + notData.profile_emisor.last_name;  
			}
		}
		if(notData.profile_mensaje != undefined){
			if(notData.profile_mensaje.first_name != undefined){
				profile_mensaje = notData.profile_mensaje.first_name + " " + notData.profile_mensaje.last_name;
			}
		}

		return {profile_emisor: profile_emisor, profile_mensaje: profile_mensaje };
	}else{
		return "PruebaMensaje: ";
	}
};
/**
 * sendNum, Hacemos PUSH vacios con nuevos No Leidos.(Cuando se debe reducir el numero.) Este solo se usa para asegurar.
 *
 * @param {String} profile_id, ProfileID
 * @param {String|Integer} num, Cantidad en Badge a Enviar. Si es String, se castea.
 * @param {String|Integer} io, Socket a enviar. Esto no es necesario.
 * @param {Object} success, Callback
 * @callback {success}
 *
 */
function sendNum(profile_id, num, io, success){
	if(typeof num == "string"){ num = num * 1; };
	if(success == undefined){ success = function(){}; };
	
	

	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId( profile_id );
		Profile.findOne({
			_id: profile_id
		}).exec(function(errprof, profData){
			get_devices(profData._id, function(item, cb){
				tokenItem(item.token, function(token){
					cb(null, token );
				});
			}, function(err, results){
				results = Generalfunc.cleanArray( results );
				var data_send = {
					type: 2
				};
				sendMultiple(function(data){
					success( data );
				}, results, "", data_send, num);
			});
		});
	}else{
		success(null);
	}
};
/**
 * sendBadge, Hacemos PUSH vacios con nuevos No Leidos.(Cuando se debe reducir el numero.)
 *
 * @param {String} profile_id, ProfileID
 * @param {String|Integer} num, Cantidad en Badge a Enviar. Si es String, se castea.
 * @param {Object} success, Callback
 * @callback {success}
 *
 */
function sendBadge(profile_id, num,  success){
	if(typeof num == "string"){ num = num * 1; };
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId( profile_id );
		Profile.findOne({
			_id: profile_id
		}).exec(function(errprof, profData){
			
			get_devices(profData._id, function(item, cb){

				tokenItem(item.token, function(token){
					cb(null, token );
				});

			}, function(err, results){
				results = Generalfunc.cleanArray( results );

				var data_send = {
					type: 2
				};
				sendMultiple(function(data){
					success( data );
				}, results, "", data_send, num);
			});
			
		});
	}else{
		success(null);
	}
};
/**
 * sendMessNotification, Enviamos los PUSH de Mensajes.
 *
 * @param {ObjectID} id, ID de Mensaje
 * @param {Object} success, Callback
 * @param {Object} io, objeto de Socket.
 * @callback {success}
 *
 */
function sendMessNotification(id, success, io){
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId( id );
		Message.findOne({
			_id: id
		})
		.populate('profile_id')
		.populate('conversation')
		.exec(function(errMess, messData){

			var mensaje = text_create("message",messData);
			var profile_id = messData.profile_id._id;
			var profiles = messData.conversation.profiles;

			var index = profiles.indexOf( profile_id.toString());

			if( index > -1 ){
				delete profiles[index];
				profiles = Generalfunc.cleanArray(profiles);
			}

			async.map(profiles, function(item, callback){
				Profile.findOne({
					_id: item.toString()
				}).exec(function(errprof, profData){
					var name = "";
					if(messData.profile_id != undefined){
						name = messData.profile_id.first_name + " " + messData.profile_id.last_name;	
					}
					addOrGet(0, messData._id, profData._id, function(pushEvent){
						get_devices(profData._id, function(item, cb){
							tokenItem(item.token, function(token){
								cb(null, token);
							});
						}, function(err, results){
							results = Generalfunc.cleanArray( results );
							var data_send = {
								type: 0,
								message: messData
							};
							Generalfunc.NoReaded(profData._id, function(num){
								sendMultiple(function(data){
									callback(null, profData );
								},results, name+": "+mensaje.mensaje, data_send, num);
							}, function(){
								sendMultiple(function(data){
									callback(null, profData );
								},results, name+": "+mensaje.mensaje, data);
							});
						});
					});
				});
			}, function(err, results){
				success(results);
			});
		});
	}else{
		success(null);
	}
};
/**
 * sendNotification, Enviamos los PUSH de Notificaciones, usando el id para procesar todo.
 *
 * @param {Object} id, ID de la notificacion.
 * @param {function} success, Callback.
 * @callback {function}
 *
 */
function sendNotification(id, sucess){
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId( id );

		Notification.findOne({
			_id: id
		})
		.populate('profile')
		.populate('profile_emisor')
		.populate('network')
		.populate('profile_mensaje')
		.exec(function(errNot, notData){
			var mensaje = text_create("notification",notData);
			addOrGet(1, notData._id, notData.profile, function(pushEvent){
				get_devices(notData.profile, function(item, cb){

					tokenItem(item.token, function(token){
						cb(null, token);
					});

				}, function(err, results){
					results = Generalfunc.cleanArray( results );
					var data_send = {
						type: 1,
						notification: notData
					};
					Generalfunc.NoReaded(notData.profile, function(num){
						sendMultiple(function(data){
							sucess( notData.profile, num );
						},results, mensaje.mensaje, data_send, num);
					}, function(){
						sendMultiple(function(data){
							sucess( notData.profile, 0 );
						},results, mensaje.mensaje, data_send);
					});
				});
			});
		});
	}
};
/**
 * add, Crea un Push Event para gestionar los No Leidos.
 *
 * @param {Object} d, Datos para Generar el Push en la DB.
 * @param {Object} success, Callback todo bien.
 * @param {Object} fail, Callback Error.
 * @callback {function}
 *
 */
function add(d, success, fail){
	var pushevent = new PushEvent( d );
	pushevent.save(function(err, pushEv){
		if(!err && pushEv){
			success( pushEv );	
		}else{
			fail(err);
		}	
	});
};
/**
 * addOrGet, Revisa si un Push Event existe, si no es creado.
 *
 * @param {Object} type, 1 si es Notificacion, 0 si es Mensaje.
 * @param {Object} id, ID de Notificacion o Mensaje.
 * @param {ObjectID} profile, ID de Perfil.
 * @param {Object} success, Callback todo bien.
 * @param {Object} fail, Callback Error.
 * @callback {function}
 *
 */
function addOrGet(type, id, profile, success, fail){
	var data = {};
	var search = {};
	if(type == 1){
		data = {
			profile: profile,
			read:   false,
			type:  type,
			notification: id
		};
		search = {
			profile: profile,
			type: type,
			notification: id
		};
	}else{
		data = {
			profile: profile,
			read:   false,
			type:  type,
			message: id
		};
		search = {
			profile: profile,
			type: type,
			message: id
		};
	}

	
	
	PushEvent.findOne(search).populate('profile').exec(function(err, pushEventData){
		if(!err && pushEventData){
			if(pushEventData.length > 0){
				success( pushEventData );
			}else{
				add(data, function(pushEventData){
					PushEvent.findOne({ _id: pushEventData._id }).populate('profile').exec(function(err, pushEventData){
						success(pushEventData);
					});
				}, function(err){
					fail(err);
				});
			}
		}else{
			add(data, function(pushEventData){
				PushEvent.findOne({ _id: pushEventData._id }).populate('profile').exec(function(err, pushEventData){
					success(pushEventData);
				});
			}, function(err){
				fail(err);
			});
		}
	});
};
/**
 * An amazing test function
 *
 * @param {Object} anotherParameter an object you'd like to see as a string
 * @returns {string}
 *
 */
function sendOne(ca,devices, message, payload, badge, sound){
	if(typeof devices == "string"){
		sendMultiple(ca,devices, message, payload, badge, sound);
	}
};
/**
 * sendMultiple, Envia Los PUSH a los dispositivos.
 *
 * @param {Object} ca, Callback.
 * @param {Array|String} devices, ID de Dispositivos, ya sea String o Array of Strings.
 * @param {Object} message, texto para enviarlo en el PUSH.
 * @param {Object} payload, Datos que se Anexan al PUSH.
 * @param {Object} badge, Numero de Elementos No Leidos en la Notificacion.
 * @param {Object} sound, Sonido a enviarlo con el PUSH.
 * @callback {function} ca.
 *
 */
function sendMultiple(ca, devices, message, payload, badge, sound){
	if(badge == undefined || badge == null){ badge = 1; };
	if(sound == undefined || sound == null || sound == ""){ sound = "ping.aiff"; };
	if(payload == undefined){ payload = {}; };

	payload.badge = badge;
	var note        = new apn.Notification();
	var deviceToken = devices;
	note.expiry     = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge      = badge;
	note.sound      = sound;
	note.alert      = message;
	note.payload    = payload;
	note.topic      = "com.thehiveapp.thehive";

	Generalfunc.apnProvider().send(note, deviceToken).then( (result) => {
		if(result.failed[0] != undefined){
			if(result.failed[0].error != undefined){
				
			}
		}
		ca(result);
	});
};
/**
 * tokenItem, funcion para procesar cada Token de Dispositivos.
 *
 * @param {Object} token, Token de 
 * @param {function} cb, Callback.
 * @callback {function} cb.
 *
 */
function tokenItem(token, cb){
	if(token == undefined || token == "" || token == null){
		cb(null);
	}else{
		token = token.trim();
		cb(token);
	}	
};

exports.sendNot              = sendNot;
exports.get_interfaz         = get_interfaz;
exports.socket_to_profile    = socket_to_profile;
exports.tokenItem            = tokenItem;
exports.sendMultiple         = sendMultiple;
exports.add                  = add;
exports.addOrGet             = addOrGet;
exports.sendBadge            = sendBadge;
exports.sendNum              = sendNum;
exports.sendMessNotification = sendMessNotification;
exports.sendNotification     = sendNotification;
exports.get_devices          = get_devices;
exports.get_sockets          = get_sockets;
exports.text_create          = text_create;
exports.profile_notification = profile_notification;