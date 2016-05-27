
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Token              = require('./models/token');
var User               = require('./models/user');
var Job                = require('./models/job');
var Company            = require('./models/company');
var Speciality         = require('./models/speciality');
var Profile            = require('./models/profile');
var Sector             = require('./models/sector');
var Experience         = require('./models/experience');
var Skill              = require('./models/skills');


var Profilefunc = require('./functions/profilefunc');
var Experiencefunc = require('./functions/experiencefunc');
var Tokenfunc = require('./functions/tokenfunc');
var Skillfunc = require('./functions/skillfunc');

/*
type:
	101: Token Error
	111: User Doesn't Exists
	200: Success | Complete
	201: User Login

*/
exports.response = function(type,item, callback){
	switch(type){
		case 101:
			callback({ status: 'error', message: "No Permitido", data: item});
		break;
		case 200:
			callback({ status: 'success', message: "Success", data: item});
		break;
		case 201:
			callback({ status: 'logged', message: "Welcome", data: item });
		break;
		case 111:
			callback({ status: 'error', message: "User Or Password Does't Exists.", data: item});
		break;
		case 112:
			callback({ status: 'error', message: "User Exists", data: item});
		break;
		case 113:
			callback({ status: 'error', message: "Profile No Existe", data: item});
		break;
		case 404:
			callback({ status: 'error', message: "Not Found", data: item});
		break;
	}
}
exports.searchFriends = function(profile_id, text, callback){
	
}
exports.saveImage = function(file, new_path, callback){
	var tmp_path         = file.path;
	var extension = path.extname(tmp_path);
	fs.rename(tmp_path, new_path, function(err){
		fs.unlink(tmp_path, function(err){
			callback();
		});
	});
}
exports.searchProfile = function(text, callback){
	Profile.find({
		"$or":[
			{ first_name: text },
			{ last_name: text }
		]
	}).exec(function(err, ProfileData){
		if(!err && ProfileData){
			callback(true, ProfileData);
		}else{
			callback(false, ProfileData);
		}
	});
}
exports.sectorExistsOrCreate = function(search, insert, callback){
	Sector.findOne(search, function(err, sector){
		if(!err && sector){
			callback(true, sector);
		}else{
			var sector = new Sector(insert);
			sector.save();

			callback(false, sector);
		}
	});
}
exports.userProfileInsertIfDontExists = function(searchUser, userInsert, profileInsert, callback){
	User.findOne(searchUser, function(errUser, user){
		if(!errUser && user){
			callback(true,null);
		}else{
			var user = new User(userInsert);
			user.save();


			var token = new Token({
				generated_id: mongoose.Types.ObjectId(),
				user_id: user
			});
			token.save();
			delete user['password'];
			profileInsert['user_id'] = user._id;
			var profile = new Profile( profileInsert );
			profile.save(function(err, profileData){
				Profilefunc.generate_qrcode(profileData);
				callback( false, token );	
			});
		}
	});
}
exports.ProfileId = function(profile_id, callback){
	Profile.findOne({ _id: profile_id }, function(errProfile, profile){
		if(!errProfile && profile){
			ProfileInfo.find({ profile_id: profile._id }, function(errProfileInfo, profileinfo){
				Experience.find({ profile_id: profile}).exec( function(err, experiences){

					if(!err && experiences.length > 0){
						callback(true, profile, profileinfo, experiences);
					}else{
						callback(false, profile, profileinfo, experiences);
					}
				});
				
			});
		}else{
			callback(101);
		}
	});
}
exports.userProfileLogin = function(email, password, callback){
	User.findOne({ email: email, password: password }, function(errUser, user){
		if(!errUser && user){
			Token.findOne({ user_id: user._id}, function(errToken, token){
				Profile.findOne({ user_id: user._id }, function(errProfile, profile){
					callback(true,token, user, profile);
				});
			});
		}else{
			callback(false);
		}
	});
}
exports.specialityExistsOrCreate = function(search, insert, callback){
	Speciality.findOne(search, function(err, speciality){
		if(!err && speciality){
			callback(true,speciality);
		}else{
			var speciality = new Speciality(insert);
			speciality.save();
			callback(false, speciality);
		}
	});
}
exports.skillAddProfile = function(name, profile_id, callback){
	Skill.findOne({ name: name}, function(err, skill){
		if(!err && skill){
			Profile.findOne({ _id: profile_id}, function(err, profile){
				Profile.findOne({
					skills: {
						_id: skill._id
					}
				}, function(errSkillExist, skillExistData){
					if(!errSkillExist && skillExistData){
						callback(true, skill, profile);		
					}else{
						profile.skills.push(skill);
						profile.save(function(err, profile){
							callback(false, skill, profile);
						});
					}
				});
				
			});
			
		}else{
			var skill = new Skill({
				name: name
			});
			skill.save(function(err, skill){
				Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
					profileData.skills.push({name: skill.name });
					profileData.save(function(err, profile){
						callback(false, skill, profile);
					});
				});
			});
		}
	});
}
exports.skillExistsOrCreate = function(search, insert, callback){
	Skill.findOne(search, function(err, skill){
		if(!err && skill){
			callback(true, skill);
		}else{
			var skill = new Skill(insert);
			skill.save();
			callback(false, skill);
		}
	});
}
exports.skillProfileExistsOrCreate = function(search, insert, callback){
	SkillProfile.findOne(search, function(err, skillProfile){
		if(!err && skillProfile){
			callback(true, skillProfile);
		}else{
			var skillProfile = new SkillProfile(insert);
			skillProfile.save();
			callback(false, skillProfile);
		}
	});
}
exports.experienceExistsOrCreate = function(search, insert, callback){
	Experience.findOne(search, function(err, experience){
		if(!err && experience){
			callback(true,experience);
		}else{
			var experience = new Experience(insert);
			experience.save(function(err, experience){
				Profile.findOne({ _id: experience.profile_id}, function(errProfile, profileData){
					profileData.experiences.push({
						job_name: experience.job.name,
						ocupation_name: experience.ocupation.name,
						company_name: experience.company.name,
						speciality_name: experience.speciality.name,
						sector_name: experience.sector.name,
						tipo: experience.type
					});
					profileData.save(function(err, prop){
						callback(false, experience);
					});
				});
			});
		}
	});
}
exports.experienceGet = function(profile, callback){
	Experience.find({ profile_id: profile}).exec( function(err, experiences){

		if(!err && experiences.length > 0){

			callback(true, experiences);
		
		}else{
			callback(false, experiences);
		}
		
	});
}
exports.experienceJobGet = function(name,callback) {

	Job.find({ name: new RegExp(name, "i") }, function(errJob, job){
		callback(errJob, job);
	});
}
exports.sectorGet = function(name,callback) {

	Sector.find({ name: new RegExp(name, "i") }, function(errJob, sector){
		callback(errJob, sector);
	});
}
exports.companyGet = function(name, callback){
	Company.find({ name: new RegExp(name, "i") }, function(err, company){
		callback(err, company);
	});	
}
exports.experienceSpecialityGet = function(name, callback){
	Speciality.find({ name: new RegExp(name, "i") }, function(errSpeciality, speciality){
		callback(errSpeciality, speciality);
	});
}
exports.companyExistsOrCreate = function(search, insert, callback){
	Company.findOne(search, function(err, company){
		if(!err && company){
			callback(true,company);
		}else{
			var company = new Company(insert);
			company.save();

			callback(false, company);
		}
	});
}
exports.jobExistsOrCreate = function(search, insert, callback){
	Job.findOne(search, function(err, job){
		if(!err && job){
			callback(true,job);
		}else{
			var job = new Job(insert);
			job.save();

			callback(false, job);
		}
	});
}
exports.companyExistsOrCreate = function(search, insert, callback){
	Company.findOne(search, function(err, company){
		if(!err && company){
			callback(true, company);
		}else{
			var company = new Company(insert);
			company.save();

			callback(false, company);
		}
	});
}
exports.isFriend = function(guid, profile, callback){
	
}

function profile_serch(profile){
	Experience.findOne({ profile_id: profile.id}, function(err, experience){
		var data = {
			id: profile._id,
			first_name: profile.first_name,
  			last_name: profile.last_name,
  			job: experience.job.name
		};
		return data;
	});
}