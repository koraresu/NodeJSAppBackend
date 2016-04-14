var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var experienceSchema = new Schema({
  speciality_id: { type: Schema.Types.ObjectId, ref: 'Speciality' },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});

module.exports = db.model( 'Experience' , experienceSchema );
