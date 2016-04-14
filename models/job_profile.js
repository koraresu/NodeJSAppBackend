var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var jobProfileSchema = new Schema({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job' },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  speciality_id: { type: Schema.Types.ObjectId, ref: 'Speciality' },
},{
  timestamps: true
});

module.exports = db.model( 'JobProfile' , jobProfileSchema );