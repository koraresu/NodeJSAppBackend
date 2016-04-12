var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var companySchema = new Schema({
  name:  String,
  job_id: { type: Schema.Types.ObjectId, ref: 'Job' }
},{
  timestamps: true
});

module.exports = db.model( 'Company' , companySchema );