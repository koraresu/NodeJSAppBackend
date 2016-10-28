var Tokenfunc      = require('../functions/tokenfunc');
var Profilefunc    = require('../functions/profilefunc');

module.exports = function(io){
	var gps = io.of('/gps');
	gps.on('connection', function(socket){
		console.log("GPS CONNECTED");
		socket.emit('connected',true);

		socket.on('setlocation', function(data){
			console.log(data);

			var guid      = data.guid;

			Tokenfunc.exist(guid, function(status, tokenData){
					if(status){
						Profilefunc.tokenToProfile(tokenData.generated_id,function(status, userData, profileData, profileInfoData){
							if(status){
								var d = {
									profile: profileData,
									gps: data.gps
								};
								socket.emit('getlocation', d);
								socket.broadcast.emit('getlocation', d);
							}
						});
					}
			});

			
		});
	});
}