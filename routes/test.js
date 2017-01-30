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

var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Profilefunc = require('../functions/profilefunc');
var Generalfunc = require('../functions/generalfunc');
var Notificationfunc = require('../functions/notificationfunc');

var apnProvider = Generalfunc.apnProvider();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/send/message/:profile_id/:message_id', function(req, res){
  var profile_id = req.params.profile_id;
  var message_id = req.params.message_id;


  if(mongoose.Types.ObjectId.isValid(profile_id)){
    profile_id = mongoose.Types.ObjectId( profile_id );
    if(mongoose.Types.ObjectId.isValid(message_id)){
      message_id = mongoose.Types.ObjectId( message_id );

      var push = new PushEvent({
        profile: profile_id,
        read: false,
        type:  0,
        message: message_id
      });
      push.save(function(err, pushData){
        console.log(err);
        res.json( pushData );
      });
    }
  }
  
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

