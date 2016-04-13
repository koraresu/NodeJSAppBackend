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
	
	User.findOne({ email: email}, function(errUser, user){
		account = new User({
			email: email,
			password: password,
			verified: false
		});
		account.save();

		Token.findOne({ user_id: account._id}, function(errToken, guid){
			Profile.findOne({ user_id: account._id}, function(errProfile, perfil){

				token = new Token({
					generated_id: mongoose.Types.ObjectId(),
					user_id: account
				});
				token.save();
				
				profile = new Profile({
					name:  {
						first: nombre, 
						last: apellido
					},
					user_id: account,
					verified: false
				});
				profile.save()
				
				var data = {
					status: 1,
					profile_id: profile._id,
					firstname: profile.name.first, 
					lastname: profile.name.last,
					email: account.email,
					token: token.generated_id
				};

				res.json(data);

			});
		});
	});
}