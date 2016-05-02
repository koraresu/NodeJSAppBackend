
var mongoose    = require('mongoose');
var path = require('path');
var fs = require('fs');

var Token              = require('./models/token');
var User               = require('./models/user');
var Job                = require('./models/job');
var Company            = require('./models/company');
var Speciality         = require('./models/speciality');
var Profile            = require('./models/profile');
var ProfileInfo        = require('./models/profile_info');
var Sector             = require('./models/sector');
var Experience         = require('./models/experience');
var Skill              = require('./models/skills');
var SkillProfile       = require('./models/skill_profile');
//var ExperienceCompany  = require('./models/experience_company');
//var ExperienceJob      = require('./models/experience_job');
//var CompanyProfile     = require('./models/company_profile');

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
exports.saveImage = function(file, new_path, callback){
	var tmp_path         = file.path;
	var extension = path.extname(tmp_path);
	fs.rename(tmp_path, new_path, function(err){
		fs.unlink(tmp_path, function(err){
			callback();
		});
	});
}
exports.tokenToProfile = function(guid, callback){
	Token.findOne({ generated_id: guid}, function(errToken, token){
		if(!errToken && token){
			User.findOne({ _id: token.user_id }, function(errUser, user){
				if(!errUser && user){
					user['password'] = null;
					delete user['password'];
					Profile.findOne({ user_id: user._id }, function(errProfile, profile){
						if(!errProfile && profile){
							ProfileInfo.find({ profile_id: profile._id }, function(errProfileInfo, profileinfo){
								callback(200,user, profile, profileinfo);
							});
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
			profile.save();

			callback( false, token );
		}
	});
}
exports.ProfileId = function(profile_id, callback){
	Profile.findOne({ _id: profile_id}, function(err, profile){
		callback(err, profile);
	})
}
exports.userProfileLogin = function(email, password, callback){
	User.findOne({ email: email, password: password }, function(errUser, user){
		if(!errUser && user){
			Token.findOne({ user_id: user._id}, function(errToken, token){
				Profile.findOne({ user_id: user._id }, function(errProfile, profile){
					console.log(profile);
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
			experience.save();
			callback(false, experience);
		}
	});
}
exports.experienceGet = function(profile, callback){
	Experience.find({ profile_id: profile}).exec( function(err, experiences){
		console.log(err);
		console.log(experiences.length);

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
exports.tokenExist = function(guid, callback){
	Token.findOne({ generated_id: guid}, function(errToken, token){
		if(!errToken && token){
			callback(true, token);
		}else{
			callback(false, null);
		}
		
	});
}

/*
exports.getProfile = function(guid, callback){
	Token.findOne({ generated_id: guid}, function(errToken, guid){
		User.findOne({ _id: guid.user_id},'_id email', function(errUser, user){
			Profile.findOne({ user_id: guid.user_id},'_id user_id name', function(errProfile, profile){
				ProfileHive.findOne({ profile_id: profile._id}, function(errProfileHive, profilehive){
					var err = {
						token: errToken, 
						user: errUser, 
						profile: errProfile,
						hive: errProfileHive
					};
					var data = {
						hive: profilehive,
						profile: profile, 
						user: user,
						token: guid,
						email: user.email, 
						first_name: profile.name.first,
						last_name: profile.name.last,
					}
					callback(err, data);
				});
			});
		});
	});
}
exports.getProfileHive = function(id, callback){
	ProfileHive.findOne({ _id: id }, function(errProfileHive, profileHive){
		Company.findOne({ _id: profileHive.company_id }, function(errCompany, company){
			Job.findOne({ _id: company.job_id }, function(errJob, job){
				var err  = {};
				var data = {
					hive: profileHive._id,
					company: {
						_id: company._id,
						name: company.name
						
					},
					job: {
						_id: job._id,
						name: job.name

					}
				};
				callback( err, data );
			});
		});	
	})	
}
exports.getUserLogin = function(email, password, callback){
	User.findOne({ email: email, password: password }, function(errUser, user){
		Token.findOne({ user_id: user._id}, function(errToken, guid){
			Profile.findOne({ user_id: user._id}, function(errProfile, profile){
				callback(user, guid,  profile);
			});
		});
	});
}
exports.createProfile = function(email, password,nombre, apellido,callback){
	var account;
	var token;
	var profile;
}
*/