var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var NetworkSchema = new Schema({
	profile_a:{
		id: { type: Schema.Types.ObjectId, ref: 'Profile' },
		accepted: { type: Boolean}
	},
	profile_b:{
		id: { type: Schema.Types.ObjectId, ref: 'Profile' },
		accepted: {type: Boolean}
	}
},{
  timestamps: true
});

module.exports = db.model( 'Network' , NetworkSchema );