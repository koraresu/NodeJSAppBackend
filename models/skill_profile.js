var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);
var skillProfileSchema = new Schema({
  skill_id: { type: Schema.Types.ObjectId, ref: 'Skill' },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});

module.exports = db.model( 'SkillProfile' , skillsProfileSchema );