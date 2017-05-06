var express = require('express');
var router = express.Router();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mongoose    = require('mongoose');

var async = require('async');

var model = require('../model');

var Generalfunc = require('../functions/generalfunc');

router.post('/conversations', multipartMiddleware, function(req, res){
	model.profile
	.find({})
	.populate('user_id')
	.populate('job.id')
	.populate('speciality.id')
	.populate('skills')
	.populate('experiences')
	.exec(function(err, docs){
		async.map(docs, function(item, callback){
			Generalfunc.activity(item._id, function(activity){
				var d = {
					profile: item,
					activity: activity
				};
				callback( null, d);	
			});
			
		}, function(err, results){
			res.json( results );
		});
		
	});
});
module.exports = router;