/**
 * Las rutas que se usan para mostrar el contenido en el navegador.
 *
 * @module Rutas
 */
var express = require('express');

var mongoose    = require('mongoose');
var router = express.Router();
var _jade = require('jade');
var fs = require('fs');
var async = require('async');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

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
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Profilefunc = require('../functions/profilefunc');
var Generalfunc = require('../functions/generalfunc');
var Notificationfunc = require('../functions/notificationfunc');

var apnProvider = Generalfunc.apnProvider();
router.get('/', function(req, res, next) {
  res.redirect('http://thehiveapp.mx/');
});
router.get('/bienvenida/:id', function(req, res){
  var id = req.params.id;

  if(mongoose.Types.ObjectId.isValid(id)){
    id = mongoose.Types.ObjectId(id);


    Profile.findOne({ public_id: id }).populate('user_id').exec( function(errProfile, profileData){
      if(!errProfile && profileData){
        res.render('email_bienvenida', { nombre: profileData.first_name, public_id: profileData.public_id });
      }
    });
  }
});
router.get('/app', function(req, res){
  res.redirect('https://itunes.apple.com/mx/app/the-hive/id1164208927?ls=1&mt=8');
});
router.get('/email/forgot/:id', function(req, res){
  res.render('emailforgot', {
    nombre: "Jose ",
    generated_id: req.params.id
  });
});
router.get('/unsubscribe', function(req, res){
  res.render('unsubscribe',{});
});
router.get('/email/invite', function(req, res){
  res.render('emailinvite', {
    email: "rkenshin21@gmail.com",
    nombre_invita: "Esteban Moldovan",
    email_invita:  "esteban@thehive.com"
  });
});
router.get('/verification/:id',function(req, res){
	var id = req.params.id;

  if(mongoose.Types.ObjectId.isValid(id)){
    id = mongoose.Types.ObjectId(id);


    Profile.findOne({ public_id: id }).populate('user_id').exec( function(errProfile, profileData){
      if(!errProfile && profileData){
          

          if(profileData.user_id == null){
            res.render('verified', { email: "", status: false, message: "El usuario que estas buscando no existe"});
          }else{
          profileData.user_id.verified = true;
          profileData.user_id.save(function(errUser, userData){


            Generalfunc.sendEmail("email_bienvenida.jade", {
              public_id: profileData.public_id,
              nombre: profileData.first_name,
            }, userData.email, "¡Bienvenido a la Colmena!",function(status, html){
              if(status){
                res.render('verified', { email: userData.email, status: true });
              }else{
                res.render('verified', { email: userData.email, status: false, message: "Error al enviar el correo de bienvenida" });
              }     
            });
          });
        }
      }else{
        res.render('verified', { email: userData.email, status: false, message: "El usuario que estas buscando no existe"});
      }
    });
  }else{
    res.render('verified', { email: userData.email, status: false, message: "El usuario que estas buscando no existe"});
  }
  	
});
router.get('/city/list', function(req, res){
  City.find({}).populate('state_id', '_id name').exec(function(err, cityData){
    res.json(cityData);
  });
});

router.get('/forgot/:generated', function(req, res){
  var generated_id = req.params.generated;

  var password_again = req.flash('password_again');

  
  Forgot.findOne({ generated_id: generated_id }).populate('user').exec(function(err, forgotData){
    if(!err && forgotData){
      if(forgotData.used == false){
        Profile.findOne({ user_id: forgotData.user._id }).exec(function(err, profileData){
          res.render('forgot',{ message: password_again, generated: generated_id, email: forgotData.user.email,nombre: profileData.first_name+" "+profileData.last_name });
        });    
      }else{
        res.render('forgot_thanks',{ message: "Tu contraseña ya ha sido actualizada", icon: "right.png" });
      }
    }else{
      res.render('forgot_thanks',{ message:"Error", icon: "wrong.png" });
    }
  });    
});
router.post('/forgot/thanks', function(req, res){
  

  var generated      = req.body.generated;
  var password       = req.body.password;
  var password_again = req.body.password_again;
  
  if(password == password_again){
    

    Forgot.findOne({ generated_id: generated }).populate('user').exec(function(err, forgotData){
      forgotData.used = true;
      forgotData.save(function(err, forgot){
        Profile.findOne({ user_id: forgotData.user._id }).exec(function(err, profileData){

          User.findOne({ _id: forgotData.user._id }).exec(function(err, userData){
            var pass = Profilefunc.generate_password(password);
            userData.password = pass;
            userData.save(function(err, user){
              if(!err && user){
                res.render('forgot_thanks',{ message: "Tu contraseña ha sido actualizada", icon: "right.png", generated: generated });  
              }else{
                res.render('forgot_thanks',{ message: "Un error ha sucedido.", icon: "right.png", generated: generated });
              }
              
            });
          });

          
        });
      });
    });  
  }else{
    

    req.flash('password_again', 'Tu contraseña y validacion de contraseña no son iguales.');
    res.redirect('/forgot/'+generated);
  }
});

router.post('/sendEmail',multipartMiddleware,  function(req, res){
  var asunto = req.body.asunto;
  var email  = req.body.email;
  var title  = req.body.title;
  var content = req.body.content;
  var file    = req.body.template;

  
  Generalfunc.sendEmail(file, {
    title: title,
    content: content
  }, email, asunto, function(status, html){
    if(html == undefined){
      res.send( { status: status, data: req.body });
    }else{
      res.send( html );  
    }
  });
});
module.exports = router;

