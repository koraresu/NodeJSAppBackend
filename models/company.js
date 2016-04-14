var db             = require('monk')('localhost:27017/hive'),
	Company        = db.get('company'),
	Job            = db.get('job'),
	CompanyProfile = db.get('company_profile'),
	Profile        = db.get('profile');

var companySchema = new Schema({
  title:  String,
  images: String,
  description: String,
  website: String,
  industry: String,
  type: String,
  address: String
},{
  timestamps: true
});

module.exports = db.model( 'Company' , companySchema );
