var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);







var Job         = require('../models/job');
var Company     = require('../models/company');


var profileHiveSchema = new Schema({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job' },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company'},
  especiality: { type: Schema.Types.ObjectId, ref: 'Speciality'},

  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});

profileHiveSchema.methods.findJob = function findJob(){
  Job.findOne({ }, function(){

  });
};

module.exports = db.model( 'ProfileHive' , profileHiveSchema );