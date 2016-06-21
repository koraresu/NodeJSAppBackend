var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var ConversationSchema = new Schema({
  profiles: [ { type: Schema.Types.ObjectId, ref: 'Profile' } ],
  status: { type: String },
  messages: { type: Schema.Types.Mixed }
},{
  timestamps: true
});

module.exports = db.model( 'Conversation' , ConversationSchema );

