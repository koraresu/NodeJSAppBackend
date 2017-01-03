var socket = io('http://67.222.22.154:3000/');
var guid = "5807e41d4fe3bb8e3802e474";
socket.emit('entrando',guid);
socket.on('conversationsjoin', function(data){
	console.log(data);
	$('#conversations ul').html("");
	data.forEach(function(item, index){
		console.log(item);
		$('#conversations ul').append("<li>"+item._id+"</li>")
	});
});
socket.on('message', function(data){
	console.log(data);
});

function get(element){
	var type = window.location.hash.substr(1);
	console.log(type);
	var type2 = type.split('/');

	return type2[element];
}
function addMessage(data,type){
	console.log(data);
	if(type == undefined){
		type = "";
	}

	console.log(type);
	var name = data.profile_id.first_name + " " + data.profile_id.last_name;
	$('#messages').append('<div class="message '+type+'"> <div class="profile_pic"> <img src="http://localhost:3000/profilepic/'+data.profile_id.profile_pic+'" /> </div> <div class="element"> <div class="username">'+name+'</div> <div class="text">'+data.message+'</div> </div> </div>');

	var element = document.getElementById("messages");
	heightScroll(element, function(top, height, bottom, total){
		element.scrollTop = bottom;	
	},function(top, height, bottom, total){
		console.log("No Scroll");
	});
}
function heightScroll(element,cbScroll,cbNoScroll){
	var top = element.scrollTop;
	var height = element.clientHeight;
	var bottom = element.scrollHeight;

	var total = top+height;	

	console.log(top+"|"+height+"|"+total+"|"+bottom);

	if(total == bottom){
		cbScroll(top, height, bottom, total);
	}else{
		cbScroll(top, height, bottom, total);
	}
}