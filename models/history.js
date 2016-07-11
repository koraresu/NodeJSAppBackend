var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);
var autoIncrement = require('mongoose-auto-increment');

var HistorySchema = new Schema({
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
	de_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
	action: String,// 1 = News || 3 = Cambio de Puesto || 4 = Trabajaron juntos || 5 = Busca Recomendación
	data: { type: Schema.Types.Mixed }
},{
  timestamps: true
});

HistorySchema.plugin(autoIncrement.plugin, {
    model: 'History',
    field: 'id_numerico'
});

module.exports = db.model( 'History' , HistorySchema );