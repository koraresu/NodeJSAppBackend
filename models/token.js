var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var tokenSchema = new Schema({  
  generated_id: { type: String},
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
},{
  timestamps: true
});

module.exports = db.model('Token', tokenSchema);