var Tokenfunc      = require('../functions/tokenfunc');
var Profilefunc    = require('../functions/profilefunc');

module.exports = function(io){
	var gps = io.of('/gps');
	gps.on('connection', function(socket){
		socket.emit('connected',true);
		socket.on('setlocation', function(data){
			console.log(data);
			var d = {
				profile: profileData,
				gps: data.gps
			};
			console.log(d);
			socket.emit('getlocation', d);
			socket.broadcast.emit('getlocation', d);
		});
	});
}