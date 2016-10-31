var gps = {
	lat: 20.640801,
	lng: -105.232257
};

var gpssocket = io.connect('http://67.222.22.154:3000/gps');
gpssocket.on('connect', function() {
	console.log("CONNECT");
	gpssocket.on('connected', function(data){
		console.log(data);
	});
	gpssocket.on('getlocation', function(data){
		console.log("GET LOCATION");
		console.log(data);

		array[data.profile._id] = data;
	});
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});
function sendLocation(){
	var d = {
		guid: "57f4246bde5103d506bee324",
		gps: gps
	};
	gpssocket.emit('setlocation',d);
}