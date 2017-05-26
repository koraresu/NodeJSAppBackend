/**
 * Test File is a file for testing documenation!
 *
 * @module JSDocTesting
 */
 var mongoose    = require('mongoose');

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