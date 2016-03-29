var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://admin:123@localhost:27017/hive');

var Profile  = require('..models/profile');
var User  = require('./models/user');

router.post('/create',multipartMiddleware,  function(req, res) {

	var nombre   = req.body.nombre;
	var apellido = req.body.apellido;
	var email    = req.body.email;
	var password = req.body.password;


	var account = new User({
		email: email,
		password: password
	});
	
	var profile = new Profile({
		name:  {
		  	first: nombre, 
		  	last: apellido
		},
		user_id: account
	});

	res.send("Hola");
});


module.exports = router;
