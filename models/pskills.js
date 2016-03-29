var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var skillsSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  name:   { type: String },
},{
  timestamps: true
});

module.exports = mongoose.model( 'Skills' , skillsSchema );