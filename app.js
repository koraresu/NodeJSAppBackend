var newrelic = require('newrelic');

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

/**
  Apple Push Notification
**/
var apn = require('apn');

options = {
   keyFile : "conf/key.pem",
   certFile : "conf/cert.pem",
   debug : true
};
var options = {
  token: {
    key: "conf/key.p8",
    keyId: "822637C6D9",
    teamId: "58GA47LFA6",
  },
  cert: "conf/cert.pem",
  production: true,
};

var apnProvider = new apn.Provider(options);

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
  socket.on('connect', function () { 
    console.log("Connected");
  });
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
    console.log("CLIENT GPS:"+clientGPS.length);
    if(data == undefined || data == null){
      socket.emit('getlocation',{ message: "GET DATA UNDEFINED OR NULL"});
    }else{
      if(data.guid == undefined || data.guid == null){
        console.log("No GUID");
        socket.emit('getlocation',{ message: "GUID UNDEFINED OR NULL"});
      }else{
        gpsrouter.set(data.guid, data.gps,socket.id,  function(status, locationData){
          if(!status){
            var clientsGPSWY = clientGPS.filter(function(element){
              return element == socket;
            });

            clientsGPSWY.forEach(function(item, index){
              gpsrouter.find(item.id, function(err, locationData){
                console.log("Emit to Other");
                console.log(socket.id);

                item.emit('getlocation', { data: locationData, type: "other" });
              });
            });
          }
        });
      }
    }

    
  });
});
var chatrouter = require('./routes/chat');

io.on('connection', function(socket){
  socket.on('entrando', function(msg){
    socket.guid = msg;

    chatrouter.setOnline(msg, socket.id, function(status, socketData, profileData){
      var conversations = chatrouter.conversationsJoin(socket, function(status, roomsData){
        socket.emit('conversationsjoin',roomsData);
      });
    });
  });
  socket.on('device', function(msg){
    console.log("DEVICE");
    console.log("MSG:");
    console.log( msg );
    console.log("GUID:" + socket.guid );
    chatrouter.setDevice(socket.guid, msg, function(status, deviceData, profileData){
      console.log( deviceData );
    });
  });
  socket.on('message', function(data){
    console.log( data );
    chatrouter.message(data, function(status, messageData){
      if(status){
        //io.sockets.in(messageData.conversation.toString()).emit('message',{data: messageData, t:true, accion: 'message' });

        var d = messageData;
        
        socket.emit('message',{data: d, t:true, accion: 'message' });
        socket.broadcast.to(messageData.conversation.toString()).emit('message',{data: d, t:false, accion: 'message' });

        /******* Apple Push Notification *****/
        console.log("/******* Apple Push Notification *****/");
        chatrouter.deviceajeno(messageData.conversation.toString(), socket.id, function(statusDevice, devices){
          if(statusDevice){
            var name_push = messageData.profile_id.first_name + " " + messageData.profile_id.last_name;
            var message_push = name_push + ": " + data.message;
            async.map(devices, function(i, c){
              chatrouter.sendPush(i, message_push, name_push, messageData.conversation.toString() ,  function(result){
                c(null, result );
              });
            }, function(err, results){
              console.log( results );
            });
          }
        });
      }
    });
  });
  socket.on('conversations', function(data){
    socket.emit('conversations', socket.rooms);
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