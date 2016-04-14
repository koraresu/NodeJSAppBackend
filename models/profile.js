var db             = require('monk')('localhost:27017/hive'),
	Profile        = db.get('profile');


var profileSchema = new Schema({
  first_name: String,
  last_name: String,
  profile_pic: String,
  profile_hive: String,
  qrcode: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  lang: String
},{
  timestamps: true
});

module.exports = db.model( 'Profile' , profileSchema );
