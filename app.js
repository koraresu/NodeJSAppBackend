var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cors         = require('cors');
var socket_io    = require('socket.io');
var cookieSession = require('cookie-session')
var async = require('async');

var moment = require('moment-timezone');

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

var Generalfunc = require('./functions/generalfunc');
var Networkfunc = require('./functions/networkfunc');
var Tokenfunc = require('./functions/tokenfunc');
var Pushfunc = require('./functions/pushfunc');
var APNfunc = require('./functions/apnfunc');

var domain = "";
/*
var firebase = require("firebase");
firebase.initializeApp({
  serviceAccount: {
    projectId: "thehive-9b8ae",
    clientEmail: "foo@thehive-9b8ae.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nAIzaSyAnVAS2VQEs_ZHyW_vubuTjMpmA3mEYzlY\n-----END PRIVATE KEY-----\n"
  },
  databaseURL: "https://thehive-9b8ae.firebaseio.com"
});
*/

var app = express();

var io           = socket_io();
app.io           = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
// Make io accessible to our router
app.use(function(req,res,next){
  req.io = io;
  req.pathDir = pathDir;
  //req.firebase = firebase;
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

//app.use('/admin', admin);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send('internal server error');
})

io.sockets.on('connection', function (socket) {
  console.log('socket connected');
});
var gps = io.of('/gps');
var clientGPS = [];
var gpsrouter = require('./routes/gps');
gps.on('connection', function(socket){
  clientGPS.push(socket);
  socket.on('connect', function () {  });
  socket.on('connecting', function(data){

  });
  socket.on('disconnect', function () {
    gpsrouter.delete(socket.id.toString(), function(err, s){
      clientGPS.forEach(function(item, index){
        if(item == socket){
          delete clientGPS[index];
        }
      });
    });
  });

  socket.on('setlocation', function(data){
    if(data == undefined || data == null){
      socket.emit('getlocation',{ message: "GET DATA UNDEFINED OR NULL"});
    }else{
      if(data.guid == undefined || data.guid == null){
        socket.emit('getlocation',{ message: "GUID UNDEFINED OR NULL"});
      }else{
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
  socket.on('accept_invite', function(data){
    gpsrouter.connect(data.profile, data.friend, true, function(data, locationData){
      var name = data.friend.first_name + " " + data.friend.last_name;

      var s = locationData.socket;
      socket.to( s ).emit('gps_result',{
        message: "Tu amigo " + name + " ha aceptado la invitación."
      });
    }, io);
  });
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

chatrouter.clean(function(err){

});
io.on('connection', function(socket){
  socket.emit('entra',"Entra");
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
  socket.on('device', function(msg){
    chatrouter.setDevice(socket.guid, msg, function(status, deviceData, profileData){
      console.log( deviceData );
    });
  });
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
  socket.on('conversations', function(data){
    socket.emit('conversations', socket.rooms);
  });
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
  socket.on('notification_readed', function(data){
    Generalfunc.NotificationReaded(data, function( results ){
    }, function( err ){
      console.log("NotificationReaded Error");
      console.log(err);
    });
  });
  socket.on('disconnect', function () {
    console.log("Disconnect");
    chatrouter.delete(socket.id.toString(), function(err, s){
      console.log(s);
    });
  });
});
module.exports = app;
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
  function findSocketInRoom(){

  }