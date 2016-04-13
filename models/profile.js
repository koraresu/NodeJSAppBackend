var db             = require('monk')('localhost:27017/hive'),
	Profile        = db.get('profile');

exports.create = function(first_name, last_name,callback){
	var profile = Profile.insert({
		first_name: first_name, 
		last_name: last_name
	}, function(err, doc){
		callback(err, doc);
	});
}