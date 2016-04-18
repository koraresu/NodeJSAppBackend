
var mongoose    = require('mongoose');

var Token              = require('./models/token');
var User               = require('./models/user');
var Job                = require('./models/job');
var Company            = require('./models/company');
var Speciality         = require('./models/speciality');
var Profile            = require('./models/profile');
var ProfileInfo        = require('./models/profile_info');
//var CompanyProfile     = require('./models/company_profile');
var Experience         = require('./models/experience');
//var ExperienceCompany  = require('./models/experience_company');
//var ExperienceJob      = require('./models/experience_job');

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
	}
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
exports.userProfileLogin = function(email, password, callback){
	User.findOne({ email: email, password: password }, function(errUser, user){
		if(!errUser && user){
			Token.findOne({ user_id: user._id}, function(errToken, token){
				Profile.findOne({ user_id: user._id}, function(errProfile, profile){

				});
				callback(true,token, user);
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
		callback(err, experiences);
	});
}
exports.experienceCompanyExistsOrCreate = function(search, insert, callback){
	ExperienceCompany.findOne(search, function(err, experiencecompany){
		if(!err && experiencecompany){
			callback(true,experiencecompany);
		}else{
			var experiencecompany = new ExperienceCompany(insert);
			experiencecompany.save();
			callback(false, experiencecompany);
		}
	});
}
exports.experienceJobExistsOrCreate = function(search, insert, callback){
	ExperienceJob.findOne(search, function(err, experiencejob){
		if(!err && experiencejob){
			callback(err,experiencejob);
		}else{
			var experiencejob = new ExperienceJob(insert);
			experiencejob.save();
			callback(null, experiencejob);
		}
	});
}
exports.companyProfileExistsOrCreate = function(company, job, callback){
	CompanyProfile.findOne(search, function(err, companyprofile){
		if(!err && companyprofile){
			callback(companyprofile);
		}else{
			var companyprofile = new Job(insert);
			companyprofile.save();

			callback(null, companyprofile);
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