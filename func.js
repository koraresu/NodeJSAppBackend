var Token       = require('./models/token');
var User        = require('./models/user');
var Job         = require('./models/job');
var Company     = require('./models/company');
var Speciality  = require('./models/speciality');
var Profile     = require('./models/profile');
var ProfileHive = require('./models/profile_hive');


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