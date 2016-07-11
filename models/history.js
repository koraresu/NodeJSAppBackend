var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);
    
var HistorySchema = new Schema({
	id_numerico: { type: Number },
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
	de_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
	action: String,// 1 = News || 3 = Cambio de Puesto || 4 = Trabajaron juntos || 5 = Busca Recomendación
	data: { type: Schema.Types.Mixed }
},{
  timestamps: true
});

module.exports = db.model( 'History' , HistorySchema );