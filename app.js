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

/**
 * Quitando el limite del Event Emitter.
 */
require('events').EventEmitter.defaultMaxListeners = Infinity;

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
var socket_gps  = require('./socket/gps.js');
socket_gps(io);
var socket_chat = require('./socket/chat.js');
socket_chat(io);
module.exports = app;