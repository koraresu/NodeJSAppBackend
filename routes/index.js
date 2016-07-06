var express = require('express');
var func = require('../func');
var mongoose    = require('mongoose');
var router = express.Router();
var _jade = require('jade');
var fs = require('fs');

var Profile     = require('../models/profile');
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
router.get('/email', function(req, res){
  Profile.findOne({ _id: mongoose.Types.ObjectId("577ae1951a03379a3d80197d") }, function(errProfile, profileData){
    Profilefunc.generate_email_verification(profileData.public_id, profileData.first_name,"rkenshin21@gmail.com", "test", function(status, html){
      if(status){
        res.send(html);  
      }else{
        res.send("Error");
      }
      
    });
    
  });


});
module.exports = router;
