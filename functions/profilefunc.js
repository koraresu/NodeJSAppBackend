
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var qr = require('qr-image');

var Generalfunc = require('./generalfunc');
var Experiencefunc = require('./experiencefunc');

var Token              = require('../models/token');
var User               = require('../models/user');
var Job                = require('../models/job');
var Company            = require('../models/company');
var Speciality         = require('../models/speciality');
var Profile            = require('../models/profile');
var Sector             = require('../models/sector');
var Experience         = require('../models/experience');
var Skill              = require('../models/skills');

exports.getAll           = function(){

}
exports.get              = function(){

}
exports.insert           = function(){

}
exports.generate_qrcode  = function(profileData, callback){
	if(typeof profileData.public_id == "undefined"){
		profileData.public_id = mongoose.Types.ObjectId();
		profileData.save(function(err, profileData){
			var qr_svg = qr.image('the-hive:query?'+profileData.public_id, { type: 'png', margin: 0 });
			qr_svg.pipe(require('fs').createWriteStream('./public/qrcode/'+profileData._id+'.png'));

			var svg_string = qr.imageSync('the-hive:query?'+profileData.public_id, { type: 'png' });
		});
	}else{
		var qr_svg = qr.image('the-hive:query?'+profileData.public_id, { type: 'png', margin: 0 });
		qr_svg.pipe(require('fs').createWriteStream('./public/qrcode/'+profileData._id+'.png'));

		var svg_string = qr.imageSync('the-hive:query?'+profileData.public_id, { type: 'png' });
	}
} 
exports.update           = function(profile_id, first_name, last_name, birthday, status,speciality, job, callback){
	console.log(birthday);
	Profile.findOne({ _id: profile_id}, function(err, profileData){
		if(typeof birthday == "undefined"){
			var datebirth = ""
		}else{
			var split = birthday.split("-");
			var day = split[2];
			var month = split[1];
			month = month-1;
			var year = split[0];
			
			var datebirth = new Date(year,month,day);
		}
		
		console.log(first_name);
		console.log(last_name);
		console.log(datebirth);
		console.log(status);

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
			profileData.birthday   = datebirth;	
		}
		if(typeof status != "undefined"){
			if(status != ""){
				profileData.status     = status;	
			}
		}
		

		Experiencefunc.specialityExistsOrCreate({
			name: speciality
		},{
			name: speciality
		}, function(status, specialityData){
			Experiencefunc.jobExistsOrCreate({
				name: job,
			},{
				name: job,
			},function(status, jobData){
				console.log("JOBDATA");
				console.log(jobData);
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
exports.updateSkills     = function(profile_id, callback){

}
exports.updateInfo       = function(profile_id, callback){

}
exports.updateExperience = function(profile_id, callback){

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
exports.tokenToProfile = tokenToProfile