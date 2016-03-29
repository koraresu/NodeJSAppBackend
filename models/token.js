var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var tokenSchema = new Schema({  
  generated_id: { type: String},
  expire: { type: Date },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
},{
  timestamps: true
});

module.exports = mongoose.model('Token', tokenSchema);