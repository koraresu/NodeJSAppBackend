var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var experienceSchema = new Schema({
  //speciality_id: { type: Schema.Types.ObjectId, ref: 'Speciality' },
  job: {
  	id: { type: Schema.Types.ObjectId, ref: 'Job' },
  	name: String
  },
  ocupation: {
    id: { type: Schema.Types.ObjectId, ref: 'Job' },
    name: String
  },
  type: Number,
  company: {
  	id: { type: Schema.Types.ObjectId, ref: 'Company' },
  	name: String
  },
  speciality: {
  	id: { type: Schema.Types.ObjectId, ref: 'Speciality' },
  	name: String
  },
  sector: {
    id: { type: Schema.Types.ObjectId, ref: 'Sector' },
    name: String
  },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});

module.exports = db.model( 'Experience' , experienceSchema );
