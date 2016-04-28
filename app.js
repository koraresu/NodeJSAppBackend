var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var db = require('monk')('localhost:27017/hive')

//var users = require('./routes/users');
//var token = require('./routes/token');
//var job = require('./routes/job');
var routes     = require('./routes/index');
var profile    = require('./routes/profile');
var company    = require('./routes/company');
var skills     = require('./routes/skills');
var experience = require('./routes/experience');

//var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next){
    req.db = db;
    next();
});
app.use('/', routes);
//app.use('/users', users);
//app.use('/api/token', token);
app.use('/api/profile', profile);
app.use('/api/skills', skills);

app.use('/api/company', company);
app.use('/api/experience', experience);
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
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
