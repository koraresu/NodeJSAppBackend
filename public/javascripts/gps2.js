//20.641821, -105.232301
//20.641807, -105.232245
//20.641796, -105.232275
var gps = {
	gps:{
		lat: 20.641821,
		lng: -105.232301
	},
	guid: "5807e41d4fe3bb8e3802e474"
};

var gpssocket = io.connect('http://67.222.22.154:3000/gps');
gpssocket.on('connect', function() {
	console.log("CONNECT");
	gpssocket.on('getlocation',function(data){
		var html = "";
		data.forEach(function(item, index){

			html+='<li><img src="http://67.222.22.154:3000/profilepic/'+item.profile.profile_pic+'" />'+item.profile.first_name+" "+item.profile.last_name+'</li>';

			if((data.length-1) == index){
				document.querySelector('#lista').innerHTML = html;
			}
			
		});
	});
});

setInterval(function(){
	gpssocket.emit('setlocation', gps);
},5000);