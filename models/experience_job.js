var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var experienceJobSchema = new Schema({
  experience_id: { type: Schema.Types.ObjectId, ref: 'Experience' },
  job_id:    { type: Schema.Types.ObjectId, ref: 'Company' },
},{
  timestamps: true
});

module.exports = db.model( 'ExperienceJob' , experienceJobSchema );
