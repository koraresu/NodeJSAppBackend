var express = require('express');
var router = express.Router();
var func = require('../func'); 
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var mongoose   = require('mongoose');

var Profile  = require('../models/profile');
var User  = require('../models/user');
var Token = require('../models/token');
var ProfileData = require('../models/profile_data');



/***************************************************
*                                                  *
*   Profile Create                                 *
*   - Code                                         *
*      - 0:                                        *
*      - 1: Perfil Creado Correctamente.           *
*      - 2: El Email ya existe.                    *
*   Add New Data                                   *
*   - Create                                       *
*      - 0:                                        *
*      - 1:                                        *
*      - 2:                                        *
*                                                  *
****************************************************/


router.post('/create',multipartMiddleware,  function(req, res) {
});
router.post('/update',multipartMiddleware,  function(req, res) {
});
router.post('/delete',multipartMiddleware,  function(req, res) {
});


module.exports = router;
