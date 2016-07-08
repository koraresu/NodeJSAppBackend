var express = require('express');
var func = require('../func');
var mongoose    = require('mongoose');
var router = express.Router();
var _jade = require('jade');
var fs = require('fs');

var model = require('../model');
var Profile     = model.profile;

var Profilefunc = require('../functions/profilefunc');

var User           = require('../models/user');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/verification/:id',function(req, res){
	var id = req.params.id;
	id = mongoose.Types.ObjectId(id);
	Profile.findOne({ public_id: id }).populate('user_id').exec( function(errProfile, profileData){
		if(!errProfile && profileData){
        
        
				profileData.user_id.verified = true;
				profileData.user_id.save(function(errUser, userData){


          Generalfunc.sendEmail("email_bienvenida.jade", {
            public_id: profileData.public_id,
            nombre: profileData.first_name,
          }, userData.email, "¡Bienvenido a la Colmena!",function(status, html){
            if(status){
              Generalfunc.response(200,{
                email: userData.email
              },function(response){
                res.json( response );
              });
            }else{
              Generalfunc.response(101,{},function(response){
                res.json( response );
              });
            }     
          });
        });
		}else{
			func.response(404, {}, function(response){
				res.json(response);
			})
		}
	})
});
router.get('/email/bienvenida/:id', function(req, res){
  var id = req.params.id;

  Profile.findOne({ public_id: mongoose.Types.ObjectId( id ) }).populate("user_id").exec(function(errProfile, profileData){
    if(!errProfile && profileData){
      Profilefunc.generate_email_bienvenida(profileData.public_id , profileData.first_name,profileData.user_id.email, "Verificación de Correo", function(status, html){
        if(status){
          res.send(html);
        }else{
          res.send("File Error");
        }
      });  
    }else{
      res.send("No Profile");
    }
  });


});
router.get('/email/:id', function(req, res){
  var id = req.params.id;

  Profile.findOne({ public_id: mongoose.Types.ObjectId( id ) }).populate("user_id").exec(function(errProfile, profileData){
    if(!errProfile && profileData){
      Profilefunc.generate_email_verification(profileData.public_id , profileData.first_name,profileData.user_id.email, "Verificación de Correo", function(status, html){
        if(status){
          res.send(html);
        }else{
          res.send("File Error");
        }
      });  
    }else{
      res.send("No Profile");
    }
  });


});
module.exports = router;
