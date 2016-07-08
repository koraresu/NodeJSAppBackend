var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var NotificationSchema = new Schema({
	tipo: Number, // 0 = se ha unido | 1 = recomendación | 2 = share contacto | 3 = Envio Solucitud | 4 = Respondio Solicitud
	profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
	profile_emisor: { type: Schema.Types.ObjectId, ref: 'Profile' },
	profile_mensaje: { type: Schema.Types.ObjectId, ref: 'Profile' },
	busqueda: { type: Schema.Types.ObjectId, ref: 'History' }
},{
  timestamps: true
});

module.exports = db.model( 'Notification' , NotificationSchema );