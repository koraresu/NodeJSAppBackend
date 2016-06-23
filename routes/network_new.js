var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var _ = require('underscore');

var router = express.Router();

/*
	CARGA COMPLETA
*/

var Profile            = require('../models/profile');
var User            = require('../models/user');
var Network         = require('../models/network');

var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Networkfunc = require('../functions/networkfunc');


// CONNECT
// ACCEPT
// GET FRIENDS [20]
