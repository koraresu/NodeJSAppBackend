var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  message: { type: String }
},{
  timestamps: true
});

module.exports = db.model( 'Message' , MessageSchema );
