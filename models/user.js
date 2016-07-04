var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);
var userSchema = new Schema({
  email: { type: String },
  password: { type: String },
  verified: { type: Boolean},
  type: { type: Number }   // 0 = Normal User || 1 = Facebook User
},{
  timestamps: true
});

module.exports = db.model( 'User' , userSchema );