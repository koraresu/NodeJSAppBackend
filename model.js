var mongoose   = require('mongoose'),  
    Schema     = mongoose.Schema,
    //db_lnk          = 'mongodb://admin:123@localhost:27017/hive',
    db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);
var formatPlugin = require('mongoose-format');

var HistorySchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  de_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  action: String,// 1 = News || 3 = Cambio de Puesto || 4 = Trabajaron juntos || 5 = Busca Recomendación
  data: { type: Schema.Types.Mixed }
},{
  timestamps: true
});

var profileSchema = new Schema({
  first_name: String,
  last_name: String,
  profile_pic: String,
  profile_hive: String,
  qrcode: { type: String },
  status: { type: Number},
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  birthday: { type: Date },
  lang: String,
  experiences: [{
    tipo: Number,
    job_name: String,
    ocupation_name: String,
    company_name: String,
    speciality_name: String,
    sector_name: String
  }],
  skills: [{ name: String }],
  info: [{ type: Schema.Types.Mixed }],
  public_id: { type: Schema.Types.Mixed },
  speciality: {
    id: { type: Schema.Types.ObjectId, ref: 'specialities' },
    name: String
  },
  job: {
    id: { type: Schema.Types.ObjectId, ref: 'jobs' },
    name: String
  }
},{
  timestamps: true
});

var NetworkSchema = new Schema({
	accepted: Boolean,
	profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }]
},{
  timestamps: true
});

var companySchema = new Schema({
  name:  String,
  images: String,
  description: String,
  website: String,
  industry: String,
  type: String,
  address: String,
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' }
},{
  timestamps: true
});


var experienceSchema = new Schema({
  
  ocupation: {
    id: { type: Schema.Types.ObjectId, ref: 'jobs' },
    name: String
  },
  type: Number,
  company: {
  	id: { type: Schema.Types.ObjectId, ref: 'companies' },
  	name: String
  },
  sector: {
    id: { type: Schema.Types.ObjectId, ref: 'sectors' },
    name: String
  },
  profile_id: { type: Schema.Types.ObjectId, ref: 'profiles' },
},{
  timestamps: true
});
var ConversationSchema = new Schema({
  profiles: [ { type: Schema.Types.ObjectId, ref: 'Profile' } ],
  status: { type: String },
  messages: { type: Schema.Types.Mixed }
},{
  timestamps: true
});
var MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  message: { type: String }
},{
  timestamps: true
});

var jobSchema = new Schema({
  name: String,
},{
  timestamps: true
});

var FeedbackSchema = new Schema({
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
	title: { type: String },
	content: { type: String }
},{
  timestamps: true
});
var reviewSchema = new Schema({
	title:      String,
	content:    String,
	rate:       Number, 
	profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});
var SearchSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  text: { type: String }
},{
  timestamps: true
});
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

var skillsSchema = new Schema({
  name:   { type: String },
},{
  timestamps: true
});
var specialitySchema = new Schema({
  name: String,
},{
  timestamps: true
});
var tokenSchema = new Schema({  
  generated_id: { type: String},
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
},{
  timestamps: true
});

var userSchema = new Schema({
  email: { type: String },
  password: { type: String },
  verified: { type: Boolean},
  type: { type: Number }   // 0 = Normal User || 1 = Facebook User
},{
  timestamps: true
});

var NotificationSchema = new Schema({
  tipo: Number, // 0 = se ha unido | 1 = recomendación | 2 = share contacto | 3 = Envio Solucitud | 4 = Respondio Solicitud
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_emisor: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_mensaje: { type: Schema.Types.ObjectId, ref: 'Profile' },
  busqueda: { type: Schema.Types.ObjectId, ref: 'History' }
},{
  timestamps: true
});



// Company
exports.company      = db.model( 'Company' , companySchema );
exports.experience   = db.model( 'Experience' , experienceSchema );
exports.job          = db.model( 'Job' , jobSchema );
exports.skill        = db.model( 'Skill' , skillsSchema );
exports.speciality   = db.model( 'Speciality' , specialitySchema );
exports.sector       = db.model( 'Sector' , sectorSchema );
// Profile
exports.profile      = db.model( 'Profile' , profileSchema );
exports.network      = db.model( 'Network' , NetworkSchema );
exports.review       = db.model( 'Review' , reviewSchema );
exports.search       = db.model( 'Search' , SearchSchema );
exports.token        = db.model( 'Token', tokenSchema );
exports.user         = db.model( 'User' , userSchema );
exports.notification = db.model( 'Notification', NotificationSchema );
// History
var history          = db.model( 'History' , HistorySchema );
exports.history      = history;
exports.feedback     = db.model( 'Feedback' , FeedbackSchema );
// Chat
exports.conversation = db.model( 'Conversation' , ConversationSchema );
exports.message      = db.model( 'Message' , MessageSchema );