var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();


var Profile            = require('../models/profile');
var User            = require('../models/user');
var Network         = require('../models/network');

/* GET home page. */
router.post('/connect', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var profile_id = req.body.profile_id;
	func.tokenExist(guid, function(errToken, token){
		if(errToken){
			func.tokenToProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				Network.find({
					$or: [
						{ profile_a: { id: profileData._id, accepted: true} },
						{ profile_b: { id: profileData._id, accepted: true} },
						{ profile_a: { id: profile_id, accepted: true} },
						{ profile_b: { id: profile_id, accepted: true} },
					]
				}, function(errNetwork, networkData){
					res.json( networkData );
				});
			});
		}
	});
});
module.exports = router;