var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

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
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  lang: String
},{
  timestamps: true
});

module.exports = db.model( 'Profile' , profileSchema );