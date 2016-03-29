var mongoose   = require('mongoose'),  
	Schema     = mongoose.Schema,
	connection = mongoose.connect('mongodb://admin:123@localhost:27017/hive');

var profileSchema = new Schema({
  name:  {
  	first: String, 
  	last: String
  },
  profile: {
  	pic: String, 
  	hive: String
  },
  qrcode: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
},{
  timestamps: true
});

module.exports = connection.model( 'Profile' , profileSchema );