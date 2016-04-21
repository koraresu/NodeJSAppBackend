var express = require('express');
var func = require('../func');

var router = express.Router();


var Profile            = require('../models/profile');
var User            = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/verification/:id',function(req, res){
	var id = req.params.id;

	Profile.findOne({ _id: id }, function(errProfile, profile){
		console.log(profile);
		if(!errProfile && profile){
			User.findOne( { _id: profile.user_id }, function(err, user){
				
				user.verified = true;
				user.save();
				
				console.log(user);
				res.send("Haz verificado tu cuenta.");
			});
		}else{
			//res.send("Esta cuenta no existe.");
		}
	})
});
module.exports = router;
