var chatrouter = require('../routes/chat');

var Generalfunc       = require('../functions/generalfunc');
var Networkfunc       = require('../functions/networkfunc');
var Tokenfunc         = require('../functions/tokenfunc');
var Pushfunc          = require('../functions/pushfunc');
var APNfunc           = require('../functions/apnfunc');
var Notificationfunc  = require('../functions/notificationfunc');

var moment = require('moment-timezone');

module.exports = function(io){

chatrouter.clean(function(err){ });
  /**
   * Iniciamos la conexion del Socket General, para el manejo del Chat.
   */
io.on('connection', function(socket){
  /**
   * Al iniciar, se realiza un emit, para que el App sepa que ya se realizo la conexion.
   */
  socket.emit('entra',"Entra");
  /**
   * Al Recibir el mensaje "entra", el App envia un mensaje con el Token. para guardarlo en el Socket.
   */
  socket.on('entrando', function(msg){
    console.log("socket_chat","entrando");
    socket.guid = msg;

    chatrouter.setOnline(msg, socket.id, function(status, socketData, profileData){
      var conversations = chatrouter.conversationsJoin(socket, function(status, roomsData){
        socket.emit('conversationsjoin',roomsData);

        Generalfunc.SocketNoReaded(socket.id, function(num){

        }, function(){

        });

      });
    });
  });
  /**
   * Y al iniciar el App, y estar lista, se envia el Device Token, que es recibido por Apple.
   * Asi, el App puede recibir los PUSH(Mensajes y Notificaciones).
   * Recibimos tres eventos por parte del Dispositivo, para enviarlo, se creo la variable device_socket, para bloquear esto.
   */
   var device_socket = [];
  socket.on('device', function(msg){
    console.log("socket_chat","device", new Date().getTime() );
    console.log("socket.id",socket.id, new Date().getTime() );

    var v = device_socket.indexOf(socket.id);
    if(v == -1){
      device_socket.push( socket.id );
      v = device_socket.indexOf(socket.id);
      console.log("Its OK");
      console.log( device_socket);
      chatrouter.setDevice(socket.guid, msg, function(deviceList, profileData){
        delete device_socket[v];
      }, function(){
        delete device_socket[v];
      });
      
    }
    // chatrouter.setDevice(socket.guid, msg, function(deviceList, profileData){}, function(){});

  });
  /**
   * Al escribir un mensaje en el chat, este Evento es Activado, este Guarda el Mensaje en la Coleccion, Genera la URL para el mensaje si es una image
   * acomoda el Timezone de estos y hace un emit, hacia los dos lados, Persona que envio el mensaje y Personas que estan en la conversación(Este ultimo
   * no engloba a la persona que lo envio).
   Al finalizar Se envia la Notificación en caso de que la Aplicación este cerrada, se reciba la notificación y en caso de que este abierta se 
   muestra en la parte superior.
   */
  socket.on('message', function(data){
    console.log("socket_chat","message");
    chatrouter.message(data, function(status, messageData){
      if(status){
        //io.sockets.in(messageData.conversation.toString()).emit('message',{data: messageData, t:true, accion: 'message' });

        var udate = moment( messageData.updatedAt );
        var cdate = moment( messageData.createdAt );

        var m = ( messageData.type == 1)?"http://thehiveapp.mx:3000/messages/" + messageData.message:messageData.message;

        var d = {
          _id: messageData._id,
          updatedAt: udate.tz("America/Mexico_City").format(),
          createdAt: cdate.tz("America/Mexico_City").format(),
          conversation: messageData.conversation,
          profile_id: messageData.profile_id,
          message: m,
          type: messageData.type
        };
        
        
        var conversation_id = messageData.conversation.toString();

        socket.emit('message',{
          data: d,
          t:true,
          accion: 'message'
        });
        socket.broadcast.to( conversation_id ).emit('message',{
          data: d,
          t:false,
          accion: 'message'
        });

        /******* Apple Push Notification *****/
        
        APNfunc.sendMessNotification(messageData._id, function(profile, num){ }, socket);
      }
    });
  });
  /**
   * Al recibir este emit, se envia una mensaje para darle todos las conversaciones a las que esta dado de alta.
   */
  socket.on('conversations', function(data){
    console.log("socket_chat","conversations");
    socket.emit('conversations', socket.rooms);
  });
  /**
   * Al interactuar con una notificación(aceptarla o recharzarla), se recibe este mensaje para acomodar los parametros pertinentes en la Base de Datos
   * y a su vez, se emite un mensaje por socket, y una Notificacion.
   */
  socket.on('notification', function(data){
    console.log("socket_chat","notification");
    console.log("socket_notification", data);

    chatrouter.notification_accept2C(data, function(onlineData, networkData, notificationData, OldNotification){
      if(onlineData != null || onlineData != undefined){

        var socketid = onlineData.socket;
        
        if(socketid != undefined){
          socket.emit('notification', OldNotification);
          io.to('/#' + socketid).emit('notification', notificationData);
          socket.broadcast.to(socketid).emit('notification', notificationData);
        }
      }
    }, function(status){
      console.log("Status:" + status);
    });
    

  });
  /**
   * Al recibir una recomendación, accedemos a los helpers y creamos las noticias y notificaciones pertinente. Y geramos las respuestas para 
   * esta recomendación.
   */
  socket.on('recomendar', function(data){
    console.log("socket_chat","recomendar");
    Networkfunc.recomendar(data, function(recomendarData, notificationAnData, notificationData){
      socket.emit('recomendar_response', recomendarData);
      
      Generalfunc.profiletosocket(recomendarData.profile, function(err, sockets){
        console.log( sockets );
        if(sockets.length > 0){
          sockets.forEach(function(item, index){
            console.log( item );
            io.to('/#' + item).emit('recomendar', notificationData );
            socket.broadcast.to(item).emit('recomendar', notificationData );
          }); 
        }
      });
    }, function(){

    });
  });
  /**
   * message_readed, Mandamos a cambiar el status de un mensaje a leido, y pedimos los mensajes sin leer que tenemos, para enviarlos a la Aplicación.
   */
  var message_readed = function(data){
    chatrouter.setReadedMessage(data, function(conversationData){

      chatrouter.TokenNoReaded( data.guid, function(profileData, num){
        socket.emit('set_no_readed', num);

        APNfunc.sendBadge(profileData._id, num, function(d){
          console.log("MessageReaded Badge",d);
        });

      });
    }, function(st){
      
    });
  };

  socket.on('message_readed', function(data){
    console.log("socket_chat","message_readed");
    console.log( data );
    message_readed( data ); 
  });
  socket.on('get_no_readed', function(data){
    console.log("socket_chat","get_no_readed");
    console.log("Socket No Readed", data );
    var guid = socket.guid;

    Tokenfunc.toProfile(guid, function(status, userData, profileData){
      
      APNfunc.getPush({
        profile: profileData._id,
        type: 1,
        read: false
      }, function(pushEvent){
        console.log("PushEvent", pushEvent.length );
        console.log("PushEvent", pushEvent );

        APNfunc.sendBadge(profileData._id, pushEvent.length, function(d){
          console.log("SendBadge D:", d );
        });

      }, function(err){
        console.log("PushEvent err", err);
      });

    });
  });


  /**
   * Igual que en mensajes, Recibimos la orden de cambiar el status de una notificacion, y enviamos los mensajes sin leer.
   */
  socket.on('notification_readed', function(data){
    console.log("socket_chat","notification_readed");
    Generalfunc.NotificationReaded(data, function( results ){ });
  });

  socket.on('console.log', function(data){
    console.log("socket_chat","console.log");
    //console.log( data );
  });
  socket.on('console.content', function(data){
    console.log("socket_chat","console.content");
    //console.log( data );
  });
  socket.on('console.custom', function(data){
    console.log("socket_chat","console.custom");
    //console.log( data );
  });
  socket.on('console.login', function(data){
    console.log("socket_chat","console.login");
    //console.log( data );
  });
  socket.on('console.logout', function(data){
    console.log("socket_chat","console.logout");
    //console.log( data );
  });
  socket.on('console.error', function(data){
  });
  /**
   * Cuando un dispositivo se desconecta, ya sea por latencia o por cerrar el App, este Evento es Realizado, sirve para eliminar de la lista de 
   * Usuarios conectados. Asi podemos mantener la lista de Usuarios Conectados actualizada en todo momento. Al momento de iniciar el Servidor,
   * esta es limpiada.
   */
  socket.on('disconnect', function () {
    console.log("socket_chat","disconnect");
    chatrouter.delete(socket.id.toString(), function(err, s){
      console.log(s);
    });
  });
});
};