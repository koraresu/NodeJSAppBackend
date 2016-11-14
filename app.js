var newrelic = require('newrelic');

var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cors         = require('cors');
var socket_io    = require('socket.io');

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

var gps = require('./routes/gps');


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
  socket.on('disconnect', function () {
    console.log("Disconnected");
    socket.emit('Disconnected');
  });

  socket.on('setlocation', function(data){
    console.log(data);
    if(data == undefined || data == null){
      socket.emit('getlocation',{ message: "GET DATA UNDEFINED OR NULL"});
    }else{
      if(data.guid == undefined || data.guid == null){
        console.log("No GUID");
        socket.emit('getlocation',{ message: "GUID UNDEFINED OR NULL"});
      }else{
        gpsrouter.set(data.guid, data.gps, function(status, locationData){
          socket.profile = locationData.profile;
          socket.gps = locationData.coordinates;
          if(!status){
            gpsrouter.find(socket.gps, socket.profile, function(err, locationData){
              console.log("Emit to ME");
              console.log(locationData);
              socket.emit('getlocation', { data: locationData, type: "you" });
            });
            clientGPS.forEach(function(item, index){
              gpsrouter.find(socket.gps, item.profile, function(err, locationData){
                
                console.log(locationData);
                item.emit('getlocation', { data: locationData, type: "other" });
              });
            });
          }
        });
      }
    }

    
  });
});
var chat = io.of('/chat');
var chatrouter = require('./routes/chat');
chat.on('connection', function(socket){
  socket.on('connect', function(data){

  });
  socket.on('message', function(data){
    chatrouter.message(data, function(status, messageData){
      if(status){
        socket.emit('getmessage', {data: messageData, t:true});
        socket.broadcast.emit('getmessage', {data: messageData, t:false});
      }
    });
  });
  socket.on('disconnect', function(){ });
});

module.exports = app;