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
	Profile.findOne({ public_id: id }, function(errProfile, profile){
		console.log(profile);
		if(!errProfile && profile){
			User.findOne( { _id: profile.user_id }, function(err, user){
				
				user.verified = true;
				user.save();
				
				console.log(user);
				res.send("Haz verificado tu cuenta.");	
			});
		}else{
			func.response(404, {}, function(response){
				res.json(response);
			})
		}
	})
});
router.get('/email/:id', function(req, res){
  var id = req.params.id;

  Profile.findOne({ public_id: mongoose.Types.ObjectId( id ) }).populate("user_id").exec(function(errProfile, profileData){
    if(!errProfile && profileData){
      Profilefunc.generate_email_verification(profileData.public_id , profileData.first_name,profileData.user_id.email, "test", function(status, html){
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
