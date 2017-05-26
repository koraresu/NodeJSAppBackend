/**
 * Test File is a file for testing documenation!
 *
 * @module JSDocTesting
 */
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _jade = require('jade');
var async = require('async');

var model = require('../model');
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
var Conversation = model.conversation;
var Message      = model.message;
var Device       = model.device;
var Online       = model.online;
var PushEvent    = model.pushevent;
var Push         = model.push;
var City         = model.city;
var State        = model.state;
var Country      = model.country;
var Email        = model.email;

var Tokenfunc = require('./tokenfunc');
var Pushfunc = require('./pushfunc');
var APNfunc = require('./apnfunc');

var apn = require('apn');

var options = {
  token: {
    key: "conf/key.p8",
    keyId: "822637C6D9",
    teamId: "58GA47LFA6",
  },
  //production: false
  production: true
};
var apnProvider = new apn.Provider(options);

var nodemailer = require('nodemailer');
var smtpConfig = {
	host: 'mail.thehiveapp.mx',
	port: 26,
	secure: false,
	tls:  {
		rejectUnauthorized: false
	},
	auth: {
		user: 'hola@thehiveapp.mx',
		pass: 'axovia es lo mejor'
	}
};
/*
var smtpConfig = {
  host: "mailtrap.io",
  port: 2525,
  auth: {
    user: "fea6a54f8a714a",
    pass: "e977cec06a0b1d"
  }
};
*/
var transporter    = nodemailer.createTransport(smtpConfig,{
	debug: true
});
/**
 * sendMail(Local), Función para el envio de correos en todo el servidor.
 *
 * @param {String} toAddress, Email de envio
 * @param {String} subject, Asunto del Correo
 * @param {String} content, Contenido o mensaje.
 * @param {function} next, La funcion next(algo asi como el Callback).
 * @next {Object}
 *
 */
var sendMail = function(toAddress, subject, content, next){
	//console.log("SmtpConfig:")
	//
	var mailOptions = {
		from: "hola@thehiveapp.mx",
		to: toAddress,
		subject: subject,
		html: content,
		list: {
			unsubscribe: {
            	url: 'http://thehiveapp.mx:3000/unsubscribe?email='+toAddress,
            	comment: 'Comment'
        	}
		}
	};
	//
	//

	transporter.sendMail(mailOptions, function(error, info){
		return next(error, info);
	});
};
/**
 * apn, Acceso a la Libreria para el APN.
 *
 * @return {APN} Acceso a la Libreria de Apple Push Notification
 *
 */
exports.apn = function(){
	return apn;
}
/**
 * apnProvider, Acceso a el Objeto de la Libreria, ya configurado.
 *
 * @return {Object} Acceso a el Objeto de la Libreria de Apple Push Notification ya configurada.
 *
 */
exports.apnProvider = function(){
	return apnProvider;
}
/**
 * saveImage, Guardar Imagenes.
 * @param {Object} file, Archivo.
 * @param {String} new_path, Direccion donde guardar la imagen.
 * @param {function} callback, 
 * @return {Object} Acceso a el Objeto de la Libreria de Apple Push Notification ya configurada.
 *
 */
exports.saveImage = function(file, new_path, callback){
	var tmp_path         = file.path;
	var extension = path.extname(tmp_path);
	fs.rename(tmp_path, new_path, function(err){
		fs.unlink(tmp_path, function(err){
			callback();
		});
	});
}
/**
 * insensitive, Para procesar los texto 
 * @param {String} text, Texto a ser procesado.
 * @return {Object} Regresa el Procesamiento del Texto.
 *
 */
exports.insensitive = function(text){
	text = text.toLowerCase();
	return text;
}
/**
 * response, Función para la respuesta de elementos.
 * @param {String} text, Texto a ser procesado.
 * @return {Object} Regresa el Procesamiento del Texto.
 *
 */
exports.response = function(type,item, callback){
	switch(type){
		case 200:
			callback({ status: 'success', code: type, message: "Success", data: item});
		break;
		case 201:
			callback({ status: 'logged', code: type, message: "Welcome", data: item });
		break;
		case 101:
			callback({ status: 'error', code: type, message: "No Permitido", data: item});
		break;
		case 111:
			callback({ status: 'error', code: type, message: "Email y/o contraseña es incorrecto", data: item});
		break;
		case 112:
			callback({ status: 'error', code: type, message: "El correo electrónico ya fue utilizado.", data: item});
		break;
		case 113:
			callback({ status: 'error', code: type, message: "Perfil inexistente", data: item});
		break;
		case 114:
			callback({ status: 'error', code: type, message: "No Son Amigos", data: item});
		break;
		case 404:
			callback({ status: 'error', code: type, message: "No encontrado", data: item});
		break;
		default:
			callback({ status: 'unknown', code: type, message: item.message, data: item.data});
		break;
	}
}
/**
 * cleanArray, Función para limpiar el arreglo.
 * @param {Array} actual, Texto a ser procesado.
 * @return {Array} Regresa un Arreglo sin elementos nulos.
 *
 */
exports.cleanArray = function(actual) {
	var newArray = new Array();
	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}
	return newArray;
}
/**
 * sendMail(Global), Función para el envio de correos en todo el servidor.
 *
 * @param {String} file, Template que se usara.
 * @param {String} data, Datos a remplazar en el template.
 * @param {String} email, Correo a donde se enviara.
 * @param {String} asunto, Asunto del Correo.
 * @param {function} callback.
 * @callback {bool,HTML(si es true)}
 *
 */
exports.sendEmail = function(file, data,email, asunto, callback){
	var template = process.cwd() + '/views/';
	template+= file;
	fs.readFile(template, 'utf8', function(err, file){
		if(err){
			
			
			callback(false);
		}else {
			var compiledTmpl = _jade.compile(file, {filename: template});
			var context = data;
			var html = compiledTmpl(context);
			sendMail(email, asunto, html, function(err, response){				
				
				$db_email = new Email({
					"email": email,
					"subject": asunto,
					"content": html,
					"error": err,
					"result": response
				});
				$db_email.save(function(err, email){
					if(err){
						callback(false);
					}else{
						callback(true, html);
					}
				});
			});
    	}	
  	});	
}
/**
 * capitalize, Limpia el Texto, y solo a Mayusculas el primer elemento.
 *
 * @param {String} s, Texto.
 * @return {String} texto procesado.
 *
 */
exports.capitalize = function(s){
	s = s.toLowerCase();
	s = s.replace(/^\s*|\s*$/g, '');
	return s.charAt(0).toUpperCase() + s.slice(1);
};
/**
 * precise_round, Redondea el Numero, con la cantidad de decimales pedida.
 *
 * @param {Numeric} num, Numero a redondear.
 * @param {Integer} decimals, Numero de decimales.
 * @return {Numeric} texto procesado.
 *
 */
exports.precise_round = function(num, decimals) {
	var t = Math.pow(10, decimals);
	var result = (Math.round((num * t) + (decimals>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
	return result/1;
}
/**
 * profile_ajeno, Obtiene el perfil Diferente al Perfil Entregado de una Arreglo de Perfiles.
 *
 * @param {ObjectId} profileID, ID del Perfil.
 * @param {Array} profiles, Arreglo de Perfiles.
 * @return {ProfileObject} Profile.
 *
 */
exports.profile_ajeno = function(profileID,profiles){
	var first  = profiles[0];
	var second = profiles[1];

	if(first._id.toString() == profileID.toString()){
		return second;
	}else{
		return first;
	}
}
/**
 * push, Envia petición de notificaciones a el APN.(No se usa)
 *
 * @callback {Object} Resultado de el Envio.
 *
 */
exports.push = function(){
	var note = new apn.Notification();
	var deviceToken = device;
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = badge;
	note.sound = sound;
	note.alert = message;
	note.payload = payload;
	note.topic = "com.thehiveapp.thehive";

	apnProvider.send(note, deviceToken).then( (result) => {
		
		if(result.failed[0] != undefined){
			if(result.failed[0].error != undefined){
				
			}
		}
    	ca(result);
	});
}
/**
 * sendPush,
 *
 * @param {Array | String} device, Arreglo de Device ID o DeviceID.
 * @param {ObjectId} payload, contenido extra a enviar en el Push.
 * @param {ObjectId} message, Texto que mostrara la Notificación.
 * @param {ObjectId} badge, Numero de Notificaciones no leidas.
 * @param {ObjectId} sound, Sonido que se emitira al llegar el mensaje.
 * @callback {function} ca, Callback.
 *
 */
exports.sendPush = function(device, payload, message, badge, sound, ca){
	if(sound == undefined || sound == null){
		sound = "ping.aiff";
	}
	var note = new apn.Notification();
	var deviceToken = device;
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = badge;
	note.sound = sound;
	note.alert = message;
	note.payload = payload;
	note.topic = "com.thehiveapp.thehive";

	apnProvider.send(note, deviceToken).then( (result) => {
		
		if(result.failed[0] != undefined){
			if(result.failed[0].error != undefined){
				
			}
		}
    	ca(result);
	});
}
/**
 * isValid, Revisar si el ID enviado es un ObjectID valido.
 *
 * @param {Array | String} id, Arreglo de Device ID o DeviceID.
 * @param {function} success, Callback al todo estar bien.
 * @param {function} fail, Callback no sea valido.
 
 * @callback {success|fail}.
 *
 */
exports.isValid = function(id, success, fail){
	if(mongoose.Types.ObjectId.isValid(id)){
		success(mongoose.Types.ObjectId(id));
	}else{
		fail();
	}
}
/**
 * profile_equal, Obtener cierto perfil de un arreglo de perfiles.
 *
 * @param {ObjectId} profileID, 
 * @param {Array} profiles, Arreglo de Perfiles.
 *
 * @return {ProfileObject}.
 *
 */
function profile_equal(profileID, profiles){
	var first  = profiles[0];
	var second = profiles[1];

	var element;
	var number = -1;
	if(first._id.toString() == profileID.toString()){
		element = first;
		number = 0;
	}else{
		element = second;
		number = 1;
	}
	return { number: number, profile: element };
}

exports.profile_equal = profile_equal;
/**
 * sendPushtoAll, Envia Push a todos los Dispositivos.(***)
 *
 * @param {Integer} type, 
 * @param {ObjectId} profileId, ID 
 * @param {String} message, Texto a enviar.
 * @param {Object} payload, Datos Anexados a la Notificación.
 * @param {function} success, Callback todo perfecto.
 * @param {function} fail, Callback Error.
 *
 * @callback {success|fail}.
 *
 */
exports.sendPushtoAll = function(type,profileId, message, payload, success, fail){
	Pushfunc.addOrGet(type, message._id, profileId, function(pushEvent){
		Device.find({ profile: profileId }).populate('profile').sort({ $natural: -1 }).exec(function(err, deviceData){

			var mensaje = "";

			if(type == 0){
				mensaje = message.message;
			}else{
				//var nombre_emisor  = ;
				//var nombre_mensaje = ;
				mensaje = mensaje_create(message);
			}
			var name = deviceData.profile.first_name + " " + deviceData.profile.last_name;
			async.map(deviceData, function(item, callback){
				if(item.token == ""){
					callback(null, null);
				}else{
					
					Pushfunc.createPush(pushEvent._id, item.token, function(){
						var badge = 1;
						callback(null, item);
					}, function(){
						callback(null, null);
					});
					
				}
			}, function(err, results){
				success(err, results);
			});
		});
	}, function(err){
		fail(err);
	});
}
/**
 * sendPushOne, Envia Push a un Dispositivo.(**)
 *
 * @param {ObjectId} deviceToken, ID de Dispositivo.
 * @param {ObjectId} badge, Numero de Notificaciones no leidas.
 * @param {ObjectId} name, Nombre de la Persona. Se concatena name + message
 * @param {String} message, Texto a enviar.
 * @param {Object} payload, Datos Anexados a la Notificación.
 * @param {function} success, Callback todo perfecto.
 * @param {function} fail, Callback Error.
 *
 * @callback {success|fail}.
 *
 */
function sendPushOne(deviceToken,badge, name, message, payload,  success, fail){
	deviceToken = deviceToken.trim();
	if(name != ""){
		name = name + ": ";
	}
	var mensaje = name + message;
	if(!Number.isInteger(badge)){ badge = 1; }
	if(payload == undefined){ payload = {}; }
	if(success == undefined){ success = function(result){}; }
	if(fail == undefined){ fail = function(result){}; }
	var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = badge;
	note.sound = "ping.aiff";
	note.alert = mensaje;
	note.payload = payload;
	note.topic = "com.thehiveapp.thehive";
	if(deviceToken != ""){
		apnProvider.send(note, deviceToken).then( (result) => {
			if(result.status == "200"){
	  			success({r: result, device:  deviceToken});
			}else{
				fail(result);
			}
		});
	}else{
		fail( { status: "500", response: { reason: "Empty Device Token" } });
	}
}
/**
 * mensaje_create, Se genera el mensaje que se va a mostrar en la Notificación. Es solo para las notificaciones.
 *
 * @param {NotificationObject} data, Objeto de la Notificación.
 * @param {ObjectId} nombre_emisor, Nombre del Emisor
 * @param {ObjectId} nombre_mensaje, Nombre de un Tercero, en caso de Recomendación.
 *
 * @return {[String]}.
 *
 */
function mensaje_create(data, nombre_emisor, nombre_mensaje){
	switch(data.tipo){
		case 0: //0 = se ha unido
		message = "¡Tu contacto " + nombre_emisor + " se ha unido! ";
		clase   = "unio";
		break;
		case 1: //1 = recomendación
		message = nombre_emisor + " te recomienda a " + nombre_mensaje;
		clase   = "recomendacion";
		break;
		case 2: //2 = share contacto
		message = nombre_emisor + " quiere enviar tu contacto a "+nombre_mensaje;
		clase   = "share";
		break;
		case 3: //3 = Envio Solucitud
		if(data.clicked == 1){
			if(data.status == 1){
				message = "Tu y " + nombre_emisor + " están conectados";
				clase   = "accept";
			}else{
				message = "No aceptaste la solicitud de " + nombre_emisor;
				clase   = "accept";
			}
		}else{
			message = nombre_emisor + " te quiere contactar";
			clase   = "connect";
		}
		break;
		case 4: //4 = Respondio Solicitud
		message = nombre_emisor + " te añadió";
		clase   = "accept";
		break;
		default:
		message = "";
		clase   = "";
		break;
	}
	return { mensaje: message, class: clase };
}
/**
 * NotificationReaded, Fija una Notificación como Leida.
 *
 * @param {NotificationObject} data, Objeto de la Notificación.
 * @param {function} success, Callback todo perfecto.
 * @param {function} fail, Callback Error.
 *
 * @callback {success|fail}.
 *
 */
function NotificationReaded(data, success, fail){
	var notification_id = data.notification;

	if(mongoose.Types.ObjectId.isValid( notification_id )){
		notification_id = mongoose.Types.ObjectId( notification_id );
		PushEvent.find({ type: 1, notification: notification_id }).exec(function(errPushEvent, pushEventData){
			async.map(pushEventData, function(item, callback){
				item.read = true;
				item.save(function(err, pushevent){
					if(!err && pushevent){
						callback(null, item);	
					}else{
						callback(err, null);
					}
				});
			}, function(err, results){
				if(!err){
					success(results);
				}else{
					fail(err);
				}
				
			});
		});
	}
}
/**
 * MessageReaded, Fija los Mensajes de una Conversación como Leido.
 *
 * @param {MessageObject} data, Objeto de el Mensaje.
 * @param {function} success, Callback todo perfecto.
 * @param {function} fail, Callback Error.
 *
 * @callback {success|fail}.
 *
 */
function MessageReaded(data, success, fail){
	var conversation_id = data.conversation;

	if(mongoose.Types.ObjectId.isValid( conversation_id )){
			conversation_id = mongoose.Types.ObjectId( conversation_id );
			Conversation.findOne({ _id: conversation_id }).exec(function(errConversation, conversationData){
				Message.find({ conversation: conversationData._id })
				.populate('profile_id')
				.exec(function(errMessage, messageData){
					async.map(messageData, function(item, callback){
						PushEvent.findOne({ message: item._id }).exec(function(errPushEvent, pushEventData){
							if(!errPushEvent && pushEventData){
								

								pushEventData.read = true;
								pushEventData.save(function(errPushE, pushEData){
									if(!errPushEvent && pushEData){
										callback(null, pushEData);
									}else{
										callback(errPushEvent, null);
									}
								});	
							}else{
								callack("A", null);
							}

							






						});
					}, function(err, results){
						if(!err){
							success(results);
						}else{
							fail(err);
						}
					});
				});
			});
		
	}
}
/**
 * SocketNoReaded, Usando el Socket, Obtenemos el Perfil para recuperar los Mensajes y/o Notificaciones no Leidas.
 *
 * @param {String} socket, ID del Socket Conectado.
 * @param {function} success, Callback todo perfecto.
 * @param {function} fail, Callback Error.
 *
 * @callback {success|fail}.
 *
 */
function SocketNoReaded(socket, success, fail){

	APNfunc.socket_to_profile(socket, function(profileData){
		APNfunc.get_sockets(profileData._id, function(item, callback){
				callback(null, item.socket);
		}, function(err, results){
			NoReaded(profileData._id, function(num){
				success(num);
			}, function(){
				fail(2);
			});
		});
	}, function(){
		fail(3);
	});
}
/**
 * NoReaded, Usando el Perfil para recuperar los Mensajes y/o Notificaciones no Leidas.
 *
 * @param {ProfileObject} profile_id, Registro del Perfil.
 * @param {function} success, Callback todo perfecto.
 * @param {function} fail, Callback Error.
 *
 * @callback {success|fail}.
 *
 */
function NoReaded(profile_id, success, fail){
	console.log("NoReaded Profile1", profile_id );
	if(profile_id._id != undefined){
		profile_id = profile_id._id;
	}
	console.log("NoReaded Profile2", profile_id );
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId(profile_id);
		console.log("NoReaded Profile3", profile_id );
		PushEvent.find({
			profile: profile_id,
			read: false
		}).count(function(err, num){
			console.log("NoReaded Profile Error", err );
			console.log("NoReaded Profile Num", num );
			if(err == null){
				success(num);
			}else{
				fail(1);
			}
		});
	}else{
		fail(0);
	}
}
/**
 * profiletosocket, Obtener todos los Sockets relacionados a un Perfil.
 *
 * @param {ObjectId} profile_id, ID de Perfil
 * @param {function} callback.
 * @callback {Error,Arreglo de Sockets}.
 *
 */
function profiletosocket(profile_id, callback){
	Online.find({ profiles: profile_id }).exec(function(errOnline, onlineData){
		if(!errOnline && onlineData){
			if(onlineData.length > 0){
				async.map(onlineData, function(item, ca){
					ca(null, item.socket);
				}, function(err, results){
					callback(null, results);
				});	
			}else{
				callback(errOnline, []);	
			}
		}else{
			callback(errOnline, []);
		}
	});

}
/**
 * extend, Concatenacion de Arreglos.
 *
 * @param {Array} arguments.
 * @return {Array} Nuevo Arreglo con todo.
 *
 */
function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
/**
 * review_check, Concatenacion de Arreglos.
 *
 * @param {Array} arguments.
 * @param {} me, Persona quiere hacer la Reseña.
 * @param {} friend, Persona a quien le haran la Reseña.
 *
 * @callback {Bool, Date, Date} Datos sobre la reseña. El Segundo Date es la ultima Reseña hecha. El Primer Date es el Segundo Date + los 15 dias minimos.
 *
 */
function review_check(me, friend, success){
	Review.findOne({
		profile_id: friend._id,
		profiles: {
			$all: [ me._id,friend._id ]
		}
	}).populate('profiles').populate('profile_id').sort({updatedAt: -1}).exec(function(errReview, reviewData){
		if(!errReview && reviewData){
			var now     = new Date();
			var updated = new Date(reviewData.updatedAt);
			var newdate = new Date(reviewData.updatedAt);
			newdate.setDate(updated.getDate() + 15);
			if(now >= newdate){
				success(true, newdate, updated);
			}else{
				success(false, newdate,updated);
			}	
		}else{
			var now     = new Date();
			success(true, now, now);
		}
	});
}
/**
 * censurar, Es la funcion predefinida para quitar ciertas palabras. (***) No se ha implementado.
 *
 * @param {String} text, Texto a Censurar.
 *
 * @return {String} Texto censurado.
 *
 */
function censurar(text){
	return text;
}
/**
 * formatName, Es un trim, Quita los espacios al inicio y al final de un texto.
 *
 * @param {String} text, Texto a Procesar.
 *
 * @return {String} Texto Sin espacios al inicio o final.
 *
 */
exports.formatName = function(text){
	if(text == undefined){ text = ""; }
	text = text.replace(/^\s*|\s*$/g, '');
	return text;
}
/**
 * noaccent, Quitar Acentos a los texto.
 *
 * @param {String} str, Texto a quitarle Acentos.
 *
 * @return {String} Texto sin acentos.
 *
 */
function noaccent(str){
	if(str == undefined){
		str = "";
	}else{
		str = str.replace(/á/,"a");
		str = str.replace(/Á/,"a");
		str = str.replace(/é/,"e");
		str = str.replace(/É/,"e");
		str = str.replace(/í/,"i"); 
		str = str.replace(/Í/,"i"); 
		str = str.replace(/ó/,"o"); 
		str = str.replace(/Ó/,"o"); 
		str = str.replace(/ú/,"u"); 
		str = str.replace(/Ú/,"u");
	}
	return str;
};
/**
 * distinct, Procesa un Arreglo de Objetos, para obtener arreglos unicos en base a un elemento.
 *
 * @param {String} arr, Arreglo para ser procesado.
 * @param {String} fn, Funcion donde se procesara cada elemento, este te retornara la llave que se guardara.
 *
 * @return {String} Regresa un arreglo de datos unicos.
 *
 */
function distinct(arr, fn){
  var unique = {};
  var distinct = [];
  arr.forEach(function (x) {
    var key = fn(x);
    var all = x;
    if (!unique[key]) {
      distinct.push(all);
      unique[key] = true;
    }
  });
  return distinct;
};
/**
 * sortbyaccent, Usamos Distinct y NoAccent para Ordenar un arreglo para los acentos, es usado por el Sort.
 *
 * @param {String} arr, Arreglo para ser procesado.
 * @param {String} fn, Funcion donde se procesara cada elemento, este te retornara la llave que se guardara.
 *
 * @return {Integer} 
 *
 */
function sortbyaccent(array, fn){
	return array.sort(function(a,b){

		var a_name = noaccent( fn(a) );
		var b_name = noaccent( fn(b) );
		var comparison = 0;
		if (a_name > b_name) {
			comparison = 1;
		} else if (a_name < b_name) {
			comparison = -1;
		}
		return comparison;
	});
};
/**
 * activity, Saber si un Perfil tuvo actividad, ya sea que hizo Reseñas o escribio Noticias(Se toma cualquier noticia, incluso las hechas por el sistema).
 *
 * @param {String} profile_id, ID de Perfil en String.
 * @param {function} cb, Callback.
 *
 * @callback {Integer} 
 *
 */
function activity(profile_id, cb){
	if(mongoose.Types.ObjectId.isValid( profile_id )){
		profile_id = mongoose.Types.ObjectId( profile_id );
		
		Review.find({
			profile_id: profile_id
		}).exec(function(err, revData){
			History.find({
				profile_id: profile_id
			}).exec(function(err, histData){
				var act = false;
				if((revData.length > 0) || (histData.length > 0)){
					act = true;
				}
				cb({
					activity: act,
					review:{
						count: revData.length,
						data: revData
					},
					history: {
						count: histData.length,
						data: histData
					}
				});
			});
		});
	}else{
		cb({
			review:{
				count: 0,
				data: []
			},
			history: {
				count: 0,
				data: []
			}
		});
	}	
};
/**
 * isNumber, Saber si n es Numero o no.
 *
 * @param {String} n, Revisar si es numero.
 *
 * @return {Bool} 
 *
 */
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
/**
 * pagination, Proceso para calcular la Paginación.
 *
 * @param {Integer} page, Pagina.
 * @param {Integer} max, Cantidad de elementos por pagina.
 *
 * @return {Bool} 
 *
 */
function pagination(page, max){
	max   = (isNumber(max))?max*1:10;
	pages = (isNumber(page))?(((page-1)*1)*max):0;

	return {
		max: max,
		pages: pages
	};
};
exports.pagination         = pagination;
exports.isNumber           = isNumber;
exports.activity           = activity;
exports.distinct           = distinct;
exports.censurar           = censurar;
exports.review_check       = review_check;
exports.extend             = extend;
exports.SocketNoReaded     = SocketNoReaded;
exports.NoReaded           = NoReaded;
exports.profiletosocket    = profiletosocket;
exports.NotificationReaded = NotificationReaded;
exports.MessageReaded      = MessageReaded;
exports.mensaje_create     = mensaje_create;
exports.sendPushOne        = sendPushOne;
exports.noaccent           = noaccent;
exports.sortbyaccent       = sortbyaccent;