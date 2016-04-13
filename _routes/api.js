var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();




router.post('/get/token',multipartMiddleware,  function(req, res) {

	var user = req.body.user;
	var pass = req.body.password;

	res.json([req.body, req.files ]);
});


module.exports = router;
