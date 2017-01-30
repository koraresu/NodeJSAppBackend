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

  var device = [];
  Pushfunc.prepare(profile_id, message_id, function(profile_id,message_id){
    Pushfunc.addOrGet(0, message_id, profile_id, function(pushEventData){
      Device.find({ profile: profile_id }).exec(function(err, deviceData){
        async.map(deviceData, function(item, callback){
          console.log("ITEM:");
          console.log( item );
          var token = item.token;

          console.log("DEVICE:");
          console.log( device );
          console.log("TOken:");
          console.log(token);
          console.log("Check:");
          console.log( (device.indexOf(token) >= 0) );
          if(device.indexOf(token) >= 0){
            callback(null, null);
          }else{
            device[device.length] = token;
            Pushfunc.createPush(pushEventData._id, token, function(pushData){
              callback(null, pushData);
            }, function(err){
              callback(err, null);
            });
          } 
        }, function(err, results){
          res.json({ event: pushEventData, pushes: results, devices: device });
        });
      });
    }, function(err){
      res.send("Err:" + err );
    });
  }, function(profile_id,message_id){
    res.send("Profile ID: " + profile_id + "| Message ID:" + message_id );
  });
});
router.get('/send/notification/:profile_id/:notification_id', function(req, res){
  var profile_id = req.params.profile_id;
  var notification_id = req.params.notification_id;
  Notification.findOne({ _id: notification_id }).exec(function(err, notificationData){
    Generalfunc.sendPushtoAll(1, profile_id, notificationData, {}, function(err, results){
      res.json( results );
    }, function(err){
      res.json( err );
    });
  });
});
module.exports = router;

