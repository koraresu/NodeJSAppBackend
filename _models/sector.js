var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var sectorSchema = new Schema({
  name:  String,
  images: String,
  description: String,
  website: String,
  industry: String,
  type: String,
  address: String
},{
  timestamps: true
});

module.exports = db.model( 'Sector' , sectorSchema );
