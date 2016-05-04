var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk),
    Profile         = require('./profile');

var reviewSchema = new Schema({
	title:      String,
	content:    String,
	rate:       Number, 
	de_id:      { type: Schema.Types.ObjectId, ref: 'profiles' },
	profile_id: { type: Schema.Types.ObjectId, ref: 'profiles' },
},{
  timestamps: true
});

module.exports = db.model( 'Review' , reviewSchema );