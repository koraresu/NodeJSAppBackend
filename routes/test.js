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
var APNfunc = require('../functions/apnfunc');

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
});
router.get('/notification', function(req, res){
  Notificationfunc.add({
    tipo: 5,
    profile: mongoose.Types.ObjectId("58d96d69bfe3ff3c5203f8c3"),
    profile_emisor: mongoose.Types.ObjectId("58d96caebfe3ff3c5203f8ac"),
    network: mongoose.Types.ObjectId("58e281261c4fad1f22ea0e2d"),
    clicked: false,
    status: false,
    deleted: false
  }, function(){
    res.send("Enviado");
  },req.app.io);
});

router.get('/sendpush/notification/:notification_id', function(req, res){
  //Generalfunc.sendPushOne( req.params.device_token, 1, "Jose", "Test", {}, function(results){
  var notification_id = req.params.notification_id;


  if(mongoose.Types.ObjectId.isValid(notification_id)){
    notification_id = mongoose.Types.ObjectId(notification_id);

    APNfunc.sendNotification(notification_id, function( data ){
      
      res.json( data );
    });
  }
  
});
router.get('/sendbadge/num/:profile_id', function(req, res){
  var num = req.params.num;
  var profile_id = req.params.profile_id;
  if(mongoose.Types.ObjectId.isValid(profile_id)){
    Generalfunc.NoReaded(profile_id, function(num){
      APNfunc.sendBadge(profile_id, num, function(){
        APNfunc.sendNum(profile_id, num, req.io, function(){
          res.send("Enviando");
        });
      });
    }, function(err){
      res.send(err);
    });
  }else{
    res.send("Error - Invalid");
  }
});
router.get('/sendbadge/:num/:profile_id', function(req, res){
  var num = req.params.num;
  var profile_id = req.params.profile_id;
  
  num = num*1;
  APNfunc.sendNot(profile_id, "", {}, num, function(data){
    res.json( data );
  });
});
router.get('/sendpush/message/:message_id', function(req, res){
  var message_id = req.params.message_id;


  if(mongoose.Types.ObjectId.isValid(message_id)){
    message_id = mongoose.Types.ObjectId(message_id);

    APNfunc.sendMessNotification(message_id, function( data ){
      
      res.json( data );
    });
  }
});
module.exports = router;

function readJsonFileSync(filepath, encoding){

  if (typeof (encoding) == 'undefined'){
    encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}
function getConfig(file){

  var filepath = __dirname + '/../' + file;
  return readJsonFileSync(filepath);
}
function GetInsState(state, callback){
  State.findOne({
    name: state
  }).exec(function(err, st){

    
    if(!err && st){
      
      
      
      
    }else{
      
      
    }
    
    callback(null,st);
    /*
    if(!err && st){
      callback(null, state);
    }else{
      var st = new State({
        name: state
      });
      st.save(function(err, st){
        
      });
    }
    */
  });
}
function GetInsCity(city, state, callback){
  City.findOne({
    name: city,
    state_id: state
  }).exec(function(err, st){

    
    

    callback(null,st);
  });
}
