/**
 * Archivo de Inicio de Servidor.
 *
 * @module App
 */
var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var cors          = require('cors');
var socket_io     = require('socket.io');
var cookieSession = require('cookie-session')
var async         = require('async');
// Moment
var moment = require('moment-timezone');
// Flash
var flash = require('connect-flash');

const pathDir = __dirname;

var routes       = require('./routes/index');
var profile      = require('./routes/profile');
var company      = require('./routes/company');
var skills       = require('./routes/skills');
var experience   = require('./routes/experience');
var network      = require('./routes/network');
var search       = require('./routes/search');
var publish      = require('./routes/publish');
var extra        = require('./routes/extra');
var chat         = require('./routes/chat');
var notification = require('./routes/notifications');
var gps          = require('./routes/gps');
var test         = require('./routes/test');
var metrics      = require('./routes/metrics');

var Generalfunc  = require('./functions/generalfunc');
var Networkfunc  = require('./functions/networkfunc');
var Tokenfunc    = require('./functions/tokenfunc');
var Pushfunc     = require('./functions/pushfunc');
var APNfunc      = require('./functions/apnfunc');

var app = express();
/**
 * Definimos el Socket_io, y lo agregamos a Express. Ademas de esto, se agrega en bin/www(linea 24).
 */
var io           = socket_io();
app.io           = io;

/**
 * Definimos Jade como Motor de Vistas.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(cors());
// Make io accessible to our router
app.use(function(req,res,next){
  req.io = io;
  req.pathDir = pathDir;
  next();
});

app.options('*', cors());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options 
  maxAge: 24 * 60 * 60 * 1000 // 24 hours 
}))
app.use(flash());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/**
 * Definimos nuestras Rutas Principales. Aqui se definen los prefijos de las Rutas.
 */
app.use('/', routes);
app.use('/test', test);
app.use('/api/network', network);
app.use('/api/profile', profile);
app.use('/api/skills', skills);
app.use('/api/extra', extra);
app.use('/api/chat', chat);
app.use('/api/company', company);
app.use('/api/experience', experience);
app.use('/api/search', search);
app.use('/api/publish', publish);
app.use('/api/notification', notification);
app.use('/api/metrics', metrics);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send('internal server error');
})
/**
 * Iniciamos la conexion General del Socket y Enviamos un Mensaje a consola.
 */
io.sockets.on('connection', function (socket) {
  console.log('socket connected');
});
/**
 * Inciamos el "Namespace" GPS para la sección de agregar por Localización.
 */
var gps = io.of('/gps');
var clientGPS = [];
var gpsrouter = require('./routes/gps');
/**
 * Iniciamos nuestro Namespace GPS, este solo es llamado cuando el App esta en la sección Agregar por Localización.
 */
gps.on('connection', function(socket){
/**
 * Emitimos un mensaje al App.
 */
  clientGPS.push(socket);
  socket.on('connect', function () {  });
  socket.on('connecting', function(data){

  });
/**
 * Esperamos a que la Sección "Agregar por Localización" se desconecte, para quitarla del Arreglo.
 */
  socket.on('disconnect', function () {
    gpsrouter.delete(socket.id.toString(), function(err, s){
      clientGPS.forEach(function(item, index){
        if(item == socket){
          delete clientGPS[index];
        }
      });
    });
  });
/**
 * SetLocation.- Este Evento recibe las coordenadas de el dispositivo, esto solo mientras esta en la seccion.
 * Revisamos que los datos sean definidos.
 * 
 */
  socket.on('setlocation', function(data){
    if(data == undefined || data == null){
      socket.emit('getlocation',{ message: "GET DATA UNDEFINED OR NULL"});
    }else{
      if(data.guid == undefined || data.guid == null){
        socket.emit('getlocation',{ message: "GUID UNDEFINED OR NULL"});
      }else{
        /**
         * Enviamos los datos a las rutas de GPS, para insertarla en la Coleccion y despues, buscamos en la tabla los elementos certa de el usuario. 500 metros.
         */
        gpsrouter.set(data.guid, data.gps,socket.id,  function(status, locationData){
          if(!status){
            var clientsGPSWY = clientGPS.filter(function(element){
              return element == socket;
            });

            clientsGPSWY.forEach(function(item, index){
              gpsrouter.find(item.id, function(err, locationData){
                item.emit('getlocation', { data: locationData, type: "other" });
              });
            });
          }
        });
      }
    }
  });
  /**
   * Definimos otro evento para la recepción de la Invitación. Enviamos los datos, al otro dispositivo.
   * Definimos Mensajes a enviar al Dispositivo en caso de que no Tenga Token, Perfil o Usuario.
   */
  socket.on('send_invitation', function(data){
    var guid      = data.guid;
    var public_id = data.public_id;


    gpsrouter.invite(guid, public_id, function(data, gpsData){
      var s = gpsData.socket;
      socket.to( s ).emit('gps_invite',data);

    }, function(data){
      socket.emit('gps_invited',data);
    },{
      no_token: function(){
        socket.emit('gps_invited',{ error: "Token Invalido"});
      },
      no_perfil: function(){
        socket.emit('gps_invited',{ error: "Perfil Invalido"});
      },
      no_usuario: function(){
        socket.emit('gps_invited',{ error: "Usuario no encontrado."});
      }
    });
  });
  /**
   * Cuando Se acepta, este evento se dispara, para crear la conexion, aceptar la amistad, y enviarle un mensaje a la otra persona de La 
   * Solicitud Aceptada. 
   */
  socket.on('accept_invite', function(data){
    gpsrouter.connect(data.profile, data.friend, true, function(data, locationData){
      var name = data.friend.first_name + " " + data.friend.last_name;

      var s = locationData.socket;
      socket.to( s ).emit('gps_result',{
        message: "Tu amigo " + name + " ha aceptado la invitación."
      });
    }, io);
  });
  /**
   * Si es rechazada, este evento se dispara, para generar la conexion, y acomodar el Estado como Rechazado. y se le notifica a la persona
   * Que rechazo la Solicitud.
   */
  socket.on('cancel_invite', function(data){
    gpsrouter.connect(data.profile, data.friend, false, function(data, locationData){
      var name = data.friend.first_name + " " + data.friend.last_name;

      var s = locationData.socket;
      socket.to( s ).emit('gps_result',{
        message: "Tu amigo " + name + " ha cancelado la invitación."
      });

    }, io);
  });
});
var chatrouter = require('./routes/chat');
/**
   * Al iniciar esto, se realiza una limpieza de las Colecciones, para que no quede datos no deseados en las Tablas "Online" y "Location".
   */
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
   * Y al iniciar el App, y estar lista, se envia el Device Token, que es recibido por Apple. Asi, el App puede recibir los PUSH(Mensajes y Notificaciones).
   */
  socket.on('device', function(msg){
    chatrouter.setDevice(socket.guid, msg, function(status, deviceData, profileData){
      console.log( deviceData );
    });
  });
  /**
   * Al escribir un mensaje en el chat, este Evento es Activado, este Guarda el Mensaje en la Coleccion, Genera la URL para el mensaje si es una image
   * acomoda el Timezone de estos y hace un emit, hacia los dos lados, Persona que envio el mensaje y Personas que estan en la conversación(Este ultimo
   * no engloba a la persona que lo envio).
   Al finalizar Se envia la Notificación en caso de que la Aplicación este cerrada, se reciba la notificación y en caso de que este abierta se 
   muestra en la parte superior.
   */
  socket.on('message', function(data){
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
    socket.emit('conversations', socket.rooms);
  });
  /**
   * Al interactuar con una notificación(aceptarla o recharzarla), se recibe este mensaje para acomodar los parametros pertinentes en la Base de Datos
   * y a su vez, se emite un mensaje por socket, y una Notificacion.
   */
  socket.on('notification', function(data){
    chatrouter.notification_accept2C(data, function(onlineData, networkData, notificationData, OldNotification){
      if(onlineData != null || onlineData != undefined){

        var socketid = onlineData.socket;
        if(socketid != undefined){
          socket.emit('notification', OldNotification);
          io.to('/#' + socketid).emit('notification', notificationData);
          socket.broadcast.to(socketid).emit('notification', notificationData);
        }
        APNfunc.sendNotification(notificationData._id, function(){ });
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
    console.log("message_readed");
    console.log( data );
    chatrouter.setReadedMessage(data, function(conversationData){

      chatrouter.TokenNoReaded( data.guid, function(profileData, num){
        socket.emit('set_no_readed', num);
      });
    }, function(st){
    });
  };

  socket.on('message_readed', message_readed);
  socket.on('get_no_readed', message_readed);

  /**
   * Igual que en mensajes, Recibimos la orden de cambiar el status de una notificacion, y enviamos los mensajes sin leer.
   */
  socket.on('notification_readed', function(data){
    Generalfunc.NotificationReaded(data, function( results ){
    }, function( err ){
      console.log("NotificationReaded Error");
      console.log(err);
    });
  });
  /**
   * Cuando un dispositivo se desconecta, ya sea por latencia o por cerrar el App, este Evento es Realizado, sirve para eliminar de la lista de 
   * Usuarios conectados. Asi podemos mantener la lista de Usuarios Conectados actualizada en todo momento. Al momento de iniciar el Servidor,
   * esta es limpiada.
   */
  socket.on('disconnect', function () {
    console.log("Disconnect");
    chatrouter.delete(socket.id.toString(), function(err, s){
      console.log(s);
    });
  });
});
module.exports = app;
/**
   * findClientsSocket,  Buscamos en el Rooms de Socket.IO en cierto Namespace, los sockets conectados.
   * @param {String}     El id de la Room, en este caso seria el ID de la Conversacion.
   * @param {namespace}  El nombre del NameSpace, "/" General o "/gps" GPS.
   */
function findClientsSocket(roomId, namespace) {
  var res = []
    // the default namespace is "/"
    , ns = io.of(namespace ||"/");

    if (ns) {
      for (var id in ns.connected) {
        if(roomId) {
          var index = ns.connected[id].rooms.indexOf(roomId);
          if(index !== -1) {
            res.push(ns.connected[id]);
          }
        } else {
          res.push(ns.connected[id]);
        }
      }
    }
    return res;
  }