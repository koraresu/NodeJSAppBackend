
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var _jade = require('jade');
var fs = require('fs');
var async = require("async");

var Generalfunc = require('./generalfunc');
var Experiencefunc = require('./experiencefunc');
var Networkfunc = require('./networkfunc');

var model = require('../model');

var Profile     = model.profile;
var User        = model.user;
var Token       = model.token;
var Job         = model.job;
var Company     = model.company;
var Experience  = model.experience;
var Network     = model.network;
var History     = model.history;
var Feedback    = model.feedback;
var Review      = model.review;
var Log         = model.log;
var Skill       = model.skill;
var Speciality  = model.speciality;
var Sector      = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;


exports.add = function(){

}
exports.addOrGet = function(search, add, success, fail){

}
exports.find = function(search, success, fail){

}
exports.noReaded = function(profile_id, success, fail){

}
exports.setNotReaded = function(notification, success, fail){

}
exports.setConvReaded = function(conversation, success, fail){

}

