var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk),
    Profile         = require('./profile');

var reviewSchema = new Schema({
	title:      String,
	content:    String,
	rate:       Number, 
	profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});


reviewSchema.methods.getProfileId = function(cb){
    Profile.find({ _id: this.profile_id }).exec(function(errProfile,profileData){
        if(!errProfile && profileData){
            return profileData;
        }else{
            return {};
        }
    });
}

module.exports = db.model( 'Review' , reviewSchema );