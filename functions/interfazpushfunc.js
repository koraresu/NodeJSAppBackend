/**
 * Interfaz para los Push.
 *
 * @module Helpers
 */
 var mongoose    = require('mongoose');
/**
 * prepare, Prepara la Interfaz, para poder hacer los PUSH.
 *
 * @param {String} profile_id, ID de Perfil.
 * @param {String} message_id, ID de Mensaje.
 * @param {function} success, Callback todo bien.
 * @param {function} fail, Callback Error.
 * @callback {success|fail}
 *
 */
function prepare(profile_id, message_id, success, fail){
	if(mongoose.Types.ObjectId.isValid(profile_id)){
		profile_id = mongoose.Types.ObjectId( profile_id );
	}else{
		profile_id = null;
	}
	if(mongoose.Types.ObjectId.isValid(message_id)){
		message_id = mongoose.Types.ObjectId( message_id );
	}else{
		message_id = null;
	}

	if(profile_id == null || message_id == null){
		fail(profile_id, message_id);
	}else{
		success(profile_id, message_id);
	}
}

exports.prepare    = prepare;