var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String },
  password: { type: String },
  verified: { type: Boolean},
},{
  timestamps: true
});

module.exports = mongoose.model( 'User' , userSchema );