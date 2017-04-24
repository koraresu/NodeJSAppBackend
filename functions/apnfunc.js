var mongoose    = require('mongoose');

function get_devices(profile_id, itemFn, resultFn ){
	Device.find({
		profile: profile_id
	}).exec(function(errDev, devData){
		async.map(devData, itemFn, resultFn);
	});
}
function text_create(collection, notData ){
	var prof = profile_notification(notData);
	if( collection == "notification"){
		return Generalfunc.mensaje_create(notData, prof.profile_emisor, prof.profile_mensaje);	
	}else{
		return "";
	}
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
function sendNotification(id, sucess){
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId( id );
		Notification.findOne({
			_id: id
		}).populate('profile').populate('profile_emisor').populate('network').populate('profile_mensaje').exec(function(errNot, notData){
			APNfunc.get_devices(notData.profile, function(item, cb){
				var mensaje = APNfunc.text_create("notification",notData);
				Generalfunc.sendPushOne(device_token, 1, "", mensaje.mensaje, notData, function(data){
					cb(null, data );
				}, function(data){
					cb(null, data );
				});
			}, function(err, results){
				sucess( results );
			});

		});
	}
}
exports.sendNotification     = sendNotification;
exports.get_devices          = get_devices;
exports.text_create          = text_create;
exports.profile_notification = profile_notification;