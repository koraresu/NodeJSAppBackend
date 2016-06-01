var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk),
    Experience      = require('./experience'),
    Skill           = require('./skills'),
    User            = require('./user'),
    Review          = require('./review');

var profileSchema = new Schema({
  first_name: String,
  last_name: String,
  profile_pic: String,
  profile_hive: String,
  qrcode: { type: String },
  status: { type: Number},
  user_id: { type: Schema.Types.ObjectId, ref: 'users' },
  birthday: { type: Date },
  lang: String,
  experiences: [{
    tipo: Number,
    job_name: String,
    ocupation_name: String,
    company_name: String,
    speciality_name: String,
    sector_name: String
  }],
  skills: [{ name: String }],
  info: [{ type: Schema.Types.Mixed }],
  public_id: { type: Schema.Types.Mixed },
  speciality: {
    id: { type: Schema.Types.ObjectId, ref: 'specialities' },
    name: String
  },
  job: {
    id: { type: Schema.Types.ObjectId, ref: 'jobs' },
    name: String
  }
},{
  timestamps: true
});

module.exports = db.model( 'Profile' , profileSchema );
