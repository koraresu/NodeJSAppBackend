var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var profileInfoSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  tipo:    { type: String },
  data:    { type: String }
},{
  timestamps: true
});

module.exports = db.model( 'ProfileInfo' , profileInfoSchema );