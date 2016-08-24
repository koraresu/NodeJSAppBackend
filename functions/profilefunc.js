
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');
var qr = require('qr-image');
var _ = require('underscore');
var _jade = require('jade');
var fs = require('fs');

var passwordHash = require('password-hash');

var async = require("async");

var Generalfunc = require('./generalfunc');
var Experiencefunc = require('./experiencefunc');

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

var format = require('./format');

function getTrabajo(profile_id, callback){
	var data = [];

	History.find({
		profile_id: profile_id,
		action: "3"
	}).populate('de_id').select('de_id -_id').exec(function(errHistory, historyData){
		if(historyData.length>0){
			historyData.forEach(function(historyItem, historyIndex){
				Profile.findOne({ _id: historyItem.de_id}).exec(function(errProfile, profileData){
					data.push(profileData);
					console.log(historyIndex);
					if(historyIndex+1 == historyData.length){
						callback(errProfile, data);
					}
				});
			});
		}else{
			callback(null, data);
		}
		
		
		
	});
	
}

function formatoProfile(profile_id,cb){
	if(typeof profile_id != "object"){
		profile_id = mongoose.Types.ObjectId(profile_id);
	}

	Profile.findOne({ _id: profile_id}).populate('experiences').populate('skills').populate('user_id','-password').exec(function(errProfile, profileData){
		var userData = profileData.user_id;
			Experience.find({ profile_id: profileData._id}, function(errExperience, experienceData){
				Review.find({ profile_id: profileData._id }).sort( [ ['createdAt', 'descending'] ] ).limit(2).exec(function(errReview, reviewData){

					getTrabajo(profileData, function(errTrabajo, trabajoData){
						var data = {
							profile: {
								"_id": profileData._id,
								"first_name": profileData.first_name,
								"last_name": profileData.last_name,
								"public_id": profileData.public_id,
								"email": userData.email,
								"verified": userData.verified,
								"info": profileData.info,
								"skills": profileData.skills,
								"experiences": profileData.experiences,
								"birthday": profileData.birthday,
								"job": profileData.job,
								"speciality": profileData.speciality,
								"profile_pic": profileData.profile_pic,
								"status": profileData.status,
								"qrcode": profileData.qrcode
							},
							experiences: experienceData,
							review: reviewData,
							trabajo: trabajoData
						};
						cb(data);
					})
					
				});
			});
		
		
		
	});
}

exports.formatoProfile   = formatoProfile

exports.getAll           = function(){

}
exports.get              = function(profile_id,callback){

}
exports.insert           = function(){

}
exports.findSkill = function(profile_id, skill, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
		var skills = profileData.skills;

		if(skills.length > 0){
			var element = skills.filter(function(value){
				return value.toString() === skill._id.toString()
			});
			if(element.length > 0){
				callback(true);
			}else{
				callback(false);
			}
		}else{
			callback(false);
		}
		

		
	});
}
exports.PublicId = function(public_id, callback){
	Profile.findOne({ public_id: public_id }, function(errProfile, profile){
		if(!errProfile && profile){
			callback(true, profile);
		}else{
			callback(false, profile);
		}
	});
}
function generate_qrcode(profileData, callback){
	console.log(profileData);
	profileData.qrcode = "";

	if(typeof profileData.public_id == "undefined"){
		profileData.public_id = mongoose.Types.ObjectId();
	}
	
	var qrcode = profileData.public_id;
	profileData.qrcode = qrcode+'.png';
	
	console.log(profileData);
	
	profileData.save(function(err, profileData){
		var qr_svg = qr.image('the-hive:query?'+qrcode, { type: 'png', margin: 0 });
		qr_svg.pipe(require('fs').createWriteStream('./public/qrcode/'+qrcode+'.png'));

		var svg_string = qr.imageSync('the-hive:query?'+qrcode, { type: 'png' });
		console.log(profileData);
		callback(profileData);
	});
}
exports.generate_qrcode  = generate_qrcode
function checkDate(date){
	if ( Object.prototype.toString.call(date) === "[object Date]" ) {
		if ( isNaN( date.getTime() ) ) {
			return false;
		}else{
			return true;
		}
	}else{
		return false;
	}
}
exports.update           = function(profile_id, data, callback){
	first_name = data.first_name;
	last_name  = data.last_name;
	birthday   = data.birthday;
	status     = data.status;
	speciality = data.speciality;
	job        = data.job;
	phone      = data.phone;

	Profile.findOne({ _id: profile_id}, function(err, profileData){
		if(typeof birthday == "undefined"){
			var datebirth = ""
		}else{
			var split = birthday.split("-");
			var day   = split[2];
			var month = split[1];
			month     = month-1;
			var year  = split[0];
			
			var datebirth = new Date(year,month,day);
		}

		if(typeof first_name != "undefined"){
			if(first_name != ""){
				profileData.first_name = first_name;	
			}
		}
		if(typeof last_name != "undefined"){
			if(last_name != ""){
				profileData.last_name  = last_name;	
			}
		}
		if(datebirth != ""){
			if(checkDate(datebirth)){
				profileData.birthday   = datebirth;		
			}
		}
		if(typeof status != "undefined"){
			if(status != ""){
				profileData.status     = status;	
			}
		}
		if(typeof phone != "undefined" ){
			if(phone != ""){
				profileData.phone   = phone;
			}
		}
		

		Experiencefunc.specialityExistsOrCreate({
			name: speciality
		},{
			name: speciality
		}, function(status, specialityData){
			Experiencefunc.jobExistsOrCreate({
				name: job,
				type: 1
			},{
				name: job,
				type: 1
			},function(status, jobData){
				profileData.job = {
					name: jobData.name,
					id: jobData._id
				};
				profileData.speciality = {
					name: specialityData.name,
					id: specialityData._id
				};

				profileData.save(function(err, profileData){
					if(!err && profileData){
						callback(true, profileData);	
					}else{
						callback(false, profileData);
					}
				});
			});
		});

		
	});
}
exports.addinfo          = function(profile_id, data, callback){
	Profile.findOne({ _id: profile_id }, function(err, profileData){
		profileData.info = [];
		data.forEach(function(item, index){
			
			profileData.info.push(item);

			if(index == (data.length-1)){
				profileData.save(function(err, profileData){
					callback(profileData);
				});		
			}
		});
	});
}
exports.facebookinfo          = function(profile_id, data, token, callback){
	Profile.findOne({ _id: profile_id }, function(err, profileData){
		profileData.facebookData = [];
		profileData.facebookToken = token;
		data.forEach(function(item, index){
			profileData.facebookData.push(item);
			if(index == (data.length-1)){
				profileData.save(function(err, profileData){
					callback(profileData);
				});		
			}
		});
	});
}
exports.updateProfilePic = function(profile_id, file, callback){
	var extension       = path.extname(file.path);
	var file_pic        = profile_id + extension;
	var new_path   = path.dirname(path.dirname(process.mainModule.filename)) + '/public/profilepic/' + file_pic;

	Generalfunc.saveImage(file, new_path, function(){
		Profile.findOne({ _id: profile_id}, function(err, profileData){

			profileData.profile_pic  = file_pic;
			profileData.save(function(err, profileData){
				callback(err,profileData);
			});
		});
	});
	
}
exports.userProfile = function(user, callback){
	Token.findOne({ user_id: user._id}, function(errToken, token){
		Profile.findOne({ user_id: user._id }, function(errProfile, profile){
			callback(true,token, user, profile);
		});
	});				
}
function tokenToProfile(guid, callback){
	Token.findOne({ generated_id: guid}).exec(function(errToken, token){
		if(!errToken && token){
			User.findOne({ _id: token.user_id }, function(errUser, user){
				if(!errUser && user){
					user['password'] = null;
					delete user['password'];
					Profile.findOne({ user_id: user._id }).exec(function(errProfile, profile){
						if(!errProfile && profile){
							callback(200,user, profile);
						}else{
							callback(101);
						}
						
					});
				}else{
					callback(111, null, null, null);
				}
			});
		}else{
			callback(101, null, null, null);
		}
	});
}
function PublicId(public_id, callback){
	Profile.findOne({ public_id: mongoose.Types.ObjectId(public_id) }).exec(function(errPublicId, profileData){
		if(!errPublicId && profileData){
			callback(true, profileData);
		}else{
			callback(false, profileData);
		}
	});
}
function generate_Password(password, callback){
	var hashedPassword = passwordHash.generate(password);
	return hashedPassword;
}
function compare_Password(password,in_db, cb){
	var verify = passwordHash.verify(password, in_db);
	cb(null, verify);
}

function userProfileInsertIfDontExists(searchUser, userInsert, profileInsert, callback){

	User.findOne(searchUser, function(errUser, user){
		if(!errUser && user){
			console.log("Existe el usuario");
			callback(true,null,null);
		}else{
			console.log("Creando Usuario");
			var user = new User(userInsert);
			user.save(function(errUser, userData){
				var token = new Token({
					generated_id: mongoose.Types.ObjectId(),
					user_id: userData._id
				});
				token.save(function(errToken, tokenData){
					delete userData['password'];

					user = format.user(userData);
					profileInsert['user_id'] = userData._id;
					var profile = new Profile( profileInsert );
					profile.save(function(err, profileData){
						generate_qrcode(profileData, function(profileData){
							callback( false, token, profileData, userData );		
						});
						
					});		
				});
				
			});


			
		}
	});
}
function generate_email_verification(public_id,nombre, email, asunto, cb){
	var template = process.cwd() + '/views/email.jade';
	fs.readFile(template, 'utf8', function(err, file){
		if(err){
			cb(false);
		}else {
			var compiledTmpl = _jade.compile(file, {filename: template});
			var context = { public_id: public_id, nombre:nombre };
			var html = compiledTmpl(context);

			//sendMail(email, asunto, html, function(err, response){
			Generalfunc.sendMail("rkenshin21@gmail.com", asunto, html, function(err, response){
				if(err){
					cb(false);
				}else{
					cb(true, html);
				}
			});
    	}
  	});
}
function generate_email_bienvenida(public_id,nombre, email, asunto, cb){
	var template = process.cwd() + '/views/email_bienvenida.jade';
	fs.readFile(template, 'utf8', function(err, file){
		if(err){
			cb(false);
		}else {
			var compiledTmpl = _jade.compile(file, {filename: template});
			var context = { public_id: public_id, nombre:nombre };
			var html = compiledTmpl(context);
			sendMail(email, asunto, html, function(err, response){
				if(err){
					cb(false);
				}else{
					cb(true, html);
				}
			});
    	}
  	});
}
function permitedData(getter, info_profile, callback){
	callback(true);
}
function logs(profile, code, data, callback){
	data = JSON.stringify(data);
	data = JSON.parse(data);
	var d = {
		code: code,
		profile: profile,
		data: data
	};

	var log = new Log(d);
	log.save(function(err, logData){
		callback(err, logData);
	});
}
exports.logs = logs
exports.permitedData = permitedData
exports.generate_email_bienvenida   = generate_email_bienvenida
exports.generate_email_verification   = generate_email_verification
exports.userProfileInsertIfDontExists = userProfileInsertIfDontExists
exports.generate_password             = generate_Password
exports.compare_password              = compare_Password
exports.publicId                      = PublicId
exports.tokenToProfile                = tokenToProfile