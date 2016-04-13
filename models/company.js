var db             = require('monk')('localhost:27017/hive'),
	Company        = db.get('company'),
	Job            = db.get('job'),
	CompanyProfile = db.get('company_profile'),
	Profile        = db.get('profile');

exports.create = function(guid, nombre, callback_success, callback_error, callback_complete){
	var company_insert = Company.insert({
		title: nombre,
		images: "",
		description: "",
		website: "",
		industry: "",
		type: "",
		address: ""
	}, function(err, doc){
		console.log("DOC");
		console.log(doc);
		console.log("+++++++++++++++++++++");
	});
}
exports.update = function(guid, id,data, callback){
	var company_update = Company.updateById(id, data);
	company_update.on('error', function(err){
		console.log('error:');
		console.log(err);
	});
	company_update.on('success',function(doc){
		console.log("success");
		console.log(doc);
	});
	company_update.on('complete', function(err, doc){
		console.log('complete');
		console.log(err);
		console.log(doc);
		
		callback_success(err, doc);	
	});
}
exports.createJob = function(guid,company_name, job_name, callback){
	var company = Company.findOne({ title: company_name }, function(err, doc){
		var job = Job.insert({ name: job_name }, function(err, job_doc){
			Job.findOne({ name: job_name}, function(err, job_doc){
				Profile.findOne({ _id: "570eb57e532b4097066411d7"}, function(err, profile){
					var pro = CompanyProfile.insert({
						job_id: job_doc._id,
						company_id: doc._id,
						profile_id: profile._id,
					}, function(err, company_profile){
						callback(company_profile);
					});	
				});
				
			});
		});
	});
}
exports.get = function(guid, callback){
	var company_get = Company.find({_id: "570e9d6fd7a0cc1c06df5a8f"}, function(err, doc){
		callback(err,doc);
	});
}
exports.getJob = function(guid, profile_id, callback){
	Profile.findOne({ _id: profile_id}, function(err, profile){
		CompanyProfile.find({ profile_id: profile._id }).on('complete', function(err, company_job){
			Company.find({ _id: company_job.company_id}).each(function(err, company){
				Job.findOne({ _id: company_job.job_id }).on('complete', function(err, job){
					callback(err, {profile: profile, company: company, job: job});
				});
			})
		});
	});
	
}