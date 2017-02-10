var express = require('express');

var mongoose    = require('mongoose');
var router = express.Router();
var _jade = require('jade');
var fs = require('fs');
var async = require('async');

var model = require('../model');
var Profile     = model.profile;
var User        = model.user;
var Token       = model.token;
var Job         = model.job;
var Company     = model.company;
var Experience  = model.experience;
var Network     = model.network;
var History     = model.history;
var Feedback    = model.feedback;
var Review      = model.review;
var Log         = model.log;
var Forgot      = model.forgot;
var Skill       = model.skill;
var Speciality  = model.speciality;
var Sector      = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Conversation = model.conversation;
var Message      = model.message;
var PushEvent    = model.pushevent;
var Push         = model.push;
var Device       = model.device;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Profilefunc = require('../functions/profilefunc');
var Generalfunc = require('../functions/generalfunc');
var Notificationfunc = require('../functions/notificationfunc');
var Pushfunc = require('../functions/pushfunc');

var apnProvider = Generalfunc.apnProvider();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/send/message/:profile_id/:message_id', function(req, res){
  var profile_id = req.params.profile_id;
  var message_id = req.params.message_id;
  Pushfunc.send(0, profile_id, message_id, function(results){
    res.json(results);
  }, function(st){
    res.send("Error:" + st);
  });
});
router.get('/send/notification/:profile_id/:notification_id', function(req, res){
  var profile_id = req.params.profile_id;
  var notification_id = req.params.notification_id;
  Pushfunc.send(1, profile_id, notification_id, function(results){
    res.json(results);
  }, function(st){
    res.send("Error:" + st);
  });
});
router.get('/send/message/:profile_id/:notification_id', function(req, res){
  var profile_id = req.params.profile_id;
  var notification_id = req.params.notification_id;
  Pushfunc.send(0, profile_id, notification_id, function(results){
    res.json(results);
  }, function(st){
    res.send("Error:" + st);
  });
});
router.get('/push/:device_token', function(req, res){
  Generalfunc.sendPushOne( req.params.device_token, 1, "Jose", "Test", {}, function(results){
    res.send(results);
  }, function(results){
    res.send(results);
  });
})
module.exports = router;

