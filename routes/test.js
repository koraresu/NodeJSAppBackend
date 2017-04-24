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
});
router.get('/check/', function(req, res){
  var html = "";
  Experience.find({}).exec(function(errExperience, experienceData){
    var html = "";
    async.map(experienceData, function(item, callback){
      var h = "";  
      h += '<p style="border-bottom: 1px solid #000;">' + item.company.name + " - " + item.ocupation.name + " - " + item.sector.name ;
      Profile.findOne({_id: item.profile_id}).exec(function(errProfile, profileData){
        if(!errProfile && profileData){
          h += '<p style="background-color:green;">' + profileData._id + " - " + profileData.first_name + " " + profileData.last_name + " - Existe</p>";
        }else{
          h += '<p style="background-color:gray;">' + item._id + " - NoExiste</p>";
        }
        h += "</p>";

        callback(null, h);
      });
    },function(err, results){
      html = results.join("");

      res.send(html);
    });
    
  });

});
router.get('/state/get', function(req, res){
  City.find().sort({ name: 1 }).exec(function(err, city){
    res.json( city );
  });
});
router.get('/state', function(req, res){
  var json = getConfig('codebeautify.json');
  async.map(json, function(item, callback){

    GetInsState(item.entidad, function(errState, state){
      callback(null, null);
    });
  }, function(err, results){
    State.find().sort({ name: 1 }).exec(function(err, city){
      res.json( city );
    });
    
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

router.get('/sendpush/:profile', function(req, res){
  //Generalfunc.sendPushOne( req.params.device_token, 1, "Jose", "Test", {}, function(results){
  var profile = req.params.profile;


  if(mongoose.Types.ObjectId.isValid(profile)){
    profile = mongoose.Types.ObjectId(profile);
    Device.findOne({ profile: profile, active: true }).exec(function(err, deviceData){
      var device_token = deviceData.token;

      Notification.findOne({
        profile: profile
      }).populate('profile').populate('profile_emisor').populate('network').populate('profile_mensaje').exec(function(errNot, notData){
        var profile_emisor = notData.profile_emisor.first_name + " " + notData.profile_emisor.last_name;
        var profile_mensaje = notData.profile_mensaje.first_name + " " + notData.profile_mensaje.last_name;
        var mensaje = Generalfunc.mensaje_create(notData, profile_emisor, profile_mensaje);
        Generalfunc.sendPushOne(device_token, 1, "Prueba", mensaje, notData, function(data){
          res.json( data );
        }, function(data){
          res.json( data );
        });
      });
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
      console.log( "Error:" );
      console.log( err );
      console.log( "St:" );
      console.log( st );
    }else{
      console.log( "Error:" );
      console.log( err );
    }
    console.log("+-----------------------------------------+");
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

    console.log( err );
    console.log( st );

    callback(null,st);
  });
}
