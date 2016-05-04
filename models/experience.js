var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var experienceSchema = new Schema({
  job: {
  	id: { type: Schema.Types.ObjectId, ref: 'jobs' },
  	name: String
  },
  ocupation: {
    id: { type: Schema.Types.ObjectId, ref: 'jobs' },
    name: String
  },
  type: Number,
  company: {
  	id: { type: Schema.Types.ObjectId, ref: 'companies' },
  	name: String
  },
  speciality: {
  	id: { type: Schema.Types.ObjectId, ref: 'specialities' },
  	name: String
  },
  sector: {
    id: { type: Schema.Types.ObjectId, ref: 'sectors' },
    name: String
  },
  profile_id: { type: Schema.Types.ObjectId, ref: 'profiles' },
},{
  timestamps: true
});

module.exports = db.model( 'Experience' , experienceSchema );
