function get_devices(profile_id, itemFn, resultFn ){
	Device.find({
		profile: profile_id
	}).exec(function(errDev, devData){
		async.map(devData, itemFn, resultFn);
	});
}
function text_create( notData ){
	var prof = profile_notification(notData);
	return Generalfunc.mensaje_create(notData, prof.profile_emisor, prof.profile_mensaje);
}
function profile_notification(notData){
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
}
exports.get_devices          = get_devices;
exports.text_create          = text_create;
exports.profile_notification = profile_notification;