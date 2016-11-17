var chatsocket = io.connect('http://localhost:3000/chat');
$(function() {
	
	var guid = get(1);
	var conversation = get(2);
	
	console.log(guid);
	console.log(conversation);

	chatsocket.emit('connect', {
		guid: guid
	})
	chatsocket.on('getmessage', function(data){
		var d = data.data;
		addMessage(d);
	})
	$.post('http://localhost:3000/api/chat/conversation',{
		guid: guid,
		id: conversation
	}, function(data){
		$.each(data, function(index, item){
			addMessage(item);
		});
	});
	

	$('#message').on('keypress',function(e){
		var message = $('#message').val()

		var p = e.which;
		if(p==13){
			$('#message').val("");
			chatsocket.emit('message', {
				guid: guid,
				message: message,
				conversation: conversation
			});
		}
	});
});



function get(element){
	var type = window.location.hash.substr(1);
	console.log(type);
	var type2 = type.split('/');

	return type2[element];
}
function addMessage(data){
	console.log(data);
	$('#messages').append('<div class="message"><div class="profile_pic"><img src="http://localhost:3000/profilepic/'+data.profile_id.profile_pic+'" /></div><div class="text">'+data.message+'</div></div>');

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
		cbNoScroll(top, height, bottom, total);
	}
}