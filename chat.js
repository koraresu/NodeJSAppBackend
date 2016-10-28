var chat = io.of('/chat');

chat.on('connection', function(socket){
  socket.emit('connected',true);
});