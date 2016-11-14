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
	$('#messages').append('<div class="message">'+data.message+'</div>');
}