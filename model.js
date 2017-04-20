var mongoose   = require('mongoose');

mongoose.Promise = global.Promise;

var Schema     = mongoose.Schema,
    db_lnk          = 'mongodb://matus:pbv3GM4iYUDeMUWxQD54wsLwhInar4ssEDN7o0a1EUXrQ@192.168.33.10:27017/hive',
    //db_lnk          = 'mongodb://localhost:27017/hive',
    db              = mongoose.createConnection(db_lnk);

var deepPopulate = require('mongoose-deep-populate')(mongoose);


var LogSchema = new Schema({
  table: String,
  action: String,
  data: { type: Schema.Types.Mixed }
},{
  timestamps: true
});
var log = db.model( 'Log' , LogSchema );

var logMiddleware = function(collection, action,doc, ca){
  var l = new log({
    table: collection,
    action: action,
    data: doc
  });
  l.save(function(err, logData){
    ca(err, logData);
  });
}

/*******************************************/


var HistorySchema = new Schema({
  id_numerico: { type: Number },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  de_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  action: String,// 1 = News || 3 = Cambio de Puesto || 4 = Trabajaron juntos || 5 = Busca Recomendación
  data: { type: Schema.Types.Mixed }
},{
  timestamps: true
});
HistorySchema.post('save', function(doc, next){
  logMiddleware("history","save", doc, function(err, logData){
    next();
  });
});
HistorySchema.post('save', function(doc, next){
  logMiddleware("history","save", doc, function(err, logData){
    next();
  });
});
HistorySchema.post('remove', function(doc, next){
  logMiddleware("history","remove", doc, function(err, logData){
    next();
  });
});
HistorySchema.post('update', function(doc, next){
  logMiddleware("history","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/
var profileSchema = new Schema({
  first_name: String,
  last_name: String,
  profile_pic: String,
  profile_hive: String,
  qrcode: { type: String },
  status: { type: Number},
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  birthday: { type: Date },
  facebookId: { type: String},
  facebookToken: { type: String },
  facebookData: [{ type: Schema.Types.Mixed }],
  lang: String,
  phone: String,
  experiences: [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
  skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
  info: [{ type: Schema.Types.Mixed }],
  public_id: { type: Schema.Types.Mixed },
  speciality: {
    id: { type: Schema.Types.ObjectId, ref: 'Speciality' },
    name: String
  },
  job: {
    id: { type: Schema.Types.ObjectId, ref: 'Job' },
    name: String
  },
  review_score: 0,
  block: { type: Boolean },
  location:{
    city: { type: Schema.Types.ObjectId, ref: 'City' }
  }
},{
  timestamps: true
});
profileSchema.post('save', function(doc, next){
  logMiddleware("profile","save", doc, function(err, logData){
    next();
  });
});
var deviceSchema = new Schema({
  token:   String,
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  info: { type: Schema.Types.Mixed },
  active: Boolean
});
deviceSchema.post('save', function(doc, next){
  logMiddleware("device","save", doc, function(err, logData){
    next();
  });
});

deviceSchema.post('remove', function(doc, next){
  logMiddleware("device","remove", doc, function(err, logData){
    next();
  });
});
deviceSchema.post('update', function(doc, next){
  logMiddleware("device","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/
var ForgotSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  generated_id: { type: String},
  used: {
        type: Boolean,
        default: false
    }
}, {
  timestamps: true
});
ForgotSchema.post('save', function(doc, next){
  logMiddleware("forgot","save", doc, function(err, logData){
    next();
  });
});
ForgotSchema.post('remove', function(doc, next){
  logMiddleware("forgot","remove", doc, function(err, logData){
    next();
  });
});
ForgotSchema.post('update', function(doc, next){
  logMiddleware("forgot","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var locationSchema = new Schema({
  coordinates: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
  },
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  socket: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});
locationSchema.post('save', function(doc, next){
  logMiddleware("location","save", doc, function(err, logData){
    next();
  });
});
locationSchema.post('remove', function(doc, next){
  logMiddleware("location","remove", doc, function(err, logData){
    next();
  });
});
locationSchema.post('update', function(doc, next){
  logMiddleware("location","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var CompanyClaimSchema = new Schema({
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' }
}, {
  timestamps: true
});
CompanyClaimSchema.post('save', function(doc, next){
  logMiddleware("company-claim","save", doc, function(err, logData){
    next();
  });
});
CompanyClaimSchema.post('remove', function(doc, next){
  logMiddleware("company-claim","remove", doc, function(err, logData){
    next();
  });
});
CompanyClaimSchema.post('update', function(doc, next){
  logMiddleware("company-claim","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var NetworkSchema = new Schema({
	accepted: Boolean,
	profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }]
},{
  timestamps: true
});
NetworkSchema.post('save', function(doc, next){
  logMiddleware("network","save", doc, function(err, logData){
    next();
  });
});
NetworkSchema.post('remove', function(doc, next){
  logMiddleware("network","remove", doc, function(err, logData){
    next();
  });
});
NetworkSchema.post('update', function(doc, next){
  logMiddleware("network","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var companySchema = new Schema({
  name:  String,
  images: String,
  description: String,
  website: String,
  phone: String,
  type: String,

  address: {
    calle: String,
    colonia: String,
    ciudad: { type: Schema.Types.ObjectId, ref: 'City' },
    estado: String,
    numero: String,
    postalc: String,
  },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' }
},{
  timestamps: true
});
companySchema.post('save', function(doc, next){
  logMiddleware("company","save", doc, function(err, logData){
      next();
    });
  
});
companySchema.post('remove', function(doc, next){
  logMiddleware("company","remove", doc, function(err, logData){
    next();
  });
});
companySchema.post('update', function(doc, next){
  console.log("Document:", doc );
  logMiddleware("company","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var experienceSchema = new Schema({
  type: Number,  // 0 = Independiente | 1 = Empresa
  ocupation: {
    id: { type: Schema.Types.ObjectId, ref: 'jobs' },
    name: String
  },
  company: {
  	id: { type: Schema.Types.ObjectId, ref: 'companies' },
  	name: String
  },
  sector: {
    id: { type: Schema.Types.ObjectId, ref: 'sectors' },
    name: String
  },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});
experienceSchema.post('save', function(doc, next){
  logMiddleware("experiences","save", doc, function(err, logData){
    next();
  });
});
experienceSchema.post('remove', function(doc, next){
  logMiddleware("experiences","remove", doc, function(err, logData){
    next();
  });
});
experienceSchema.post('update', function(doc, next){
  logMiddleware("experiences","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var OnlineSchema = new Schema({
  profiles: { type: Schema.Types.ObjectId, ref: 'Profile' },
  socket: { type: Schema.Types.Mixed }
},{
  timestamps: true
});
OnlineSchema.post('save', function(doc, next){
  logMiddleware("online","save", doc, function(err, logData){
    next();
  });
});
OnlineSchema.post('remove', function(doc, next){
  logMiddleware("online","remove", doc, function(err, logData){
    next();
  });
});
OnlineSchema.post('update', function(doc, next){
  logMiddleware("online","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/
var ConversationSchema = new Schema({
  profiles:    [ { type: Schema.Types.ObjectId, ref: 'Profile' } ],
  prop_status: [{ type: Number }], // 2 = Active | 1 = Archive | 0 = Deleted
  readed: [{type: Boolean}], // true = leido || false = no leido
  message: { type: Schema.Types.ObjectId, ref: 'Message' }
},{
  timestamps: true
});
ConversationSchema.post('save', function(doc, next){
  logMiddleware("conversation","save", doc, function(err, logData){
    next();
  });
});
ConversationSchema.post('remove', function(doc, next){
  logMiddleware("conversation","remove", doc, function(err, logData){
    next();
  });
});
ConversationSchema.post('update', function(doc, next){
  logMiddleware("conversation","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  type: Number, 
  message: { type: String },
  status: { type: Boolean }
},{
  timestamps: true
});
MessageSchema.post('save', function(doc, next){
  logMiddleware("message","save", doc, function(err, logData){
    next();
  });
});
MessageSchema.post('remove', function(doc, next){
  logMiddleware("message","remove", doc, function(err, logData){
    next();
  });
});
MessageSchema.post('update', function(doc, next){
  logMiddleware("message","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var jobSchema = new Schema({
  name: String,
  type: Number,   // Profesion = 0 || Puesto = 1
  parent: { type: Schema.Types.ObjectId, ref: 'Sector' }
},{
  timestamps: true
});
jobSchema.post('save', function(doc, next){
  logMiddleware("job","save", doc, function(err, logData){
    next();
  });
});
jobSchema.post('remove', function(doc, next){
  logMiddleware("job","remove", doc, function(err, logData){
    next();
  });
});
jobSchema.post('update', function(doc, next){
  logMiddleware("job","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var FeedbackSchema = new Schema({
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
	content: { type: String }
},{
  timestamps: true
});
FeedbackSchema.post('save', function(doc, next){
  logMiddleware("feedback","save", doc, function(err, logData){
    next();
  });
});
FeedbackSchema.post('remove', function(doc, next){
  logMiddleware("feedback","remove", doc, function(err, logData){
    next();
  });
});
FeedbackSchema.post('update', function(doc, next){
  logMiddleware("feedback","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var reviewSchema = new Schema({
	title:      String,
	content:    String,
	rate:       Number, 
	profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
},{
  timestamps: true
});
reviewSchema.post('save', function(doc, next){
  logMiddleware("review","save", doc, function(err, logData){
    next();
  });
});
reviewSchema.post('remove', function(doc, next){
  logMiddleware("review","remove", doc, function(err, logData){
    next();
  });
});
reviewSchema.post('update', function(doc, next){
  logMiddleware("review","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var SearchSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  text: { type: String }
},{
  timestamps: true
});
SearchSchema.post('save', function(doc, next){
  logMiddleware("search","save", doc, function(err, logData){
    next();
  });
});
SearchSchema.post('remove', function(doc, next){
  logMiddleware("search","remove", doc, function(err, logData){
    next();
  });
});
SearchSchema.post('update', function(doc, next){
  logMiddleware("search","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
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

sectorSchema.post('save', function(doc, next){
  logMiddleware("sector","save", doc, function(err, logData){
    next();
  });
});
sectorSchema.post('remove', function(doc, next){
  logMiddleware("sector","remove", doc, function(err, logData){
    next();
  });
});
sectorSchema.post('update', function(doc, next){
  logMiddleware("sector","update", doc, function(err, logData){
    next();
  });
});


/*******************************************/
var skillsSchema = new Schema({
  name:   { type: String },
},{
  timestamps: true
});
skillsSchema.post('save', function(doc, next){
  logMiddleware("skills","save", doc, function(err, logData){
    next();
  });
});
skillsSchema.post('remove', function(doc, next){
  logMiddleware("skills","remove", doc, function(err, logData){
    next();
  });
});
skillsSchema.post('update', function(doc, next){
  logMiddleware("skills","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var specialitySchema = new Schema({
  name: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Job' }
},{
  timestamps: true
});
specialitySchema.post('save', function(doc, next){
  logMiddleware("speciality","save", doc, function(err, logData){
    next();
  });
});
specialitySchema.post('remove', function(doc, next){
  logMiddleware("speciality","remove", doc, function(err, logData){
    next();
  });
});
specialitySchema.post('update', function(doc, next){
  logMiddleware("speciality","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var tokenSchema = new Schema({  
  generated_id: { type: String},
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
},{
  timestamps: true
});
tokenSchema.post('save', function(doc, next){
  logMiddleware("token","save", doc, function(err, logData){
    next();
  });
});
tokenSchema.post('remove', function(doc, next){
  logMiddleware("token","remove", doc, function(err, logData){
    next();
  });
});
tokenSchema.post('update', function(doc, next){
  logMiddleware("token","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var userSchema = new Schema({
  email: { type: String },
  password: { type: String },
  verified: { type: Boolean},
  type: { type: Number }   // 0 = Normal User || 1 = Facebook User
},{
  timestamps: true
});
userSchema.post('save', function(doc, next){
  logMiddleware("user","save", doc, function(err, logData){
    next();
  });
});
userSchema.post('remove', function(doc, next){
  logMiddleware("user","remove", doc, function(err, logData){
    next();
  });
});
userSchema.post('update', function(doc, next){
  logMiddleware("user","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var NotificationSchema = new Schema({
  tipo: Number, // -1 = Test | 0 = se ha unido | 1 = recomendación | 2 = te recomiendan | 3 = Envio Solucitud | 4 = Respondio Solicitud | 5 = Review
  
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_emisor: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_mensaje: { type: Schema.Types.ObjectId, ref: 'Profile' },

  busqueda: { type: Schema.Types.ObjectId, ref: 'History' },
  network: { type: Schema.Types.ObjectId, ref: 'Network' },
  review: { type: Schema.Types.ObjectId, ref: 'Review' },
  
  clicked: false,
  status: false,
  deleted: false
},{
  timestamps: true
});
NotificationSchema.post('save', function(doc, next){
  logMiddleware("notification","save", doc, function(err, logData){
    next();
  });
});
NotificationSchema.post('remove', function(doc, next){
  logMiddleware("notification","remove", doc, function(err, logData){
    next();
  });
});
NotificationSchema.post('update', function(doc, next){
  logMiddleware("notification","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/
var PushEventSchema = new Schema({
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  read:   Boolean,
  type:  Number,  // 1 = Notificacion | 0 = Mensaje
  notification: { type: Schema.Types.ObjectId, ref: 'Notification' },
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
  
},{
  timestamps: true
});
PushEventSchema.post('save', function(doc, next){
  logMiddleware("pushevent","save", doc, function(err, logData){
    next();
  });
});
PushEventSchema.post('remove', function(doc, next){
  logMiddleware("pushevent","remove", doc, function(err, logData){
    next();
  });
});
PushEventSchema.post('update', function(doc, next){
  logMiddleware("pushevent","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/
var PushSchema = new Schema({
  device: { type: Schema.Types.ObjectId, ref: 'Device' },
  push: { type: Schema.Types.ObjectId, ref: 'PushEvent' }
},{
  timestamps: true
});

PushSchema.post('save', function(doc, next){
  logMiddleware("push","save", doc, function(err, logData){
    next();
  });
});
PushSchema.post('remove', function(doc, next){
  logMiddleware("push","remove", doc, function(err, logData){
    next();
  });
});
PushSchema.post('update', function(doc, next){
  logMiddleware("push","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var PaisSchema = new Schema({
  name: { type: String }
});
PaisSchema.post('save', function(doc, next){
  logMiddleware("pais","save", doc, function(err, logData){
    next();
  });
});
PaisSchema.post('remove', function(doc, next){
  logMiddleware("pais","remove", doc, function(err, logData){
    next();
  });
});
PaisSchema.post('update', function(doc, next){
  logMiddleware("pais","update", doc, function(err, logData){
    next();
  });
});

/*******************************************/
var CiudadSchema = new Schema({
    "id":    { type: String },
    "state": { type: String },
    "name":  { type: String }
});
CiudadSchema.post('save', function(doc, next){
  logMiddleware("ciudad","save", doc, function(err, logData){
    next();
  });
});
CiudadSchema.post('remove', function(doc, next){
  logMiddleware("ciudad","remove", doc, function(err, logData){
    next();
  });
});
CiudadSchema.post('update', function(doc, next){
  logMiddleware("ciudad","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/
var EmailSchema = new Schema({
    "email": String,
    "subject": String,
    "content": String,
    "result": { type: Schema.Types.Mixed },
    "error": { type: Schema.Types.Mixed }
},{
  timestamps: true
});
/*******************************************/
experienceSchema.methods = {};
experienceSchema.plugin(deepPopulate);


// Company
exports.company      = db.model( 'Company' , companySchema );
exports.experience   = db.model( 'Experience' , experienceSchema );
exports.job          = db.model( 'Job' , jobSchema );
exports.location     = db.model( 'GPS', locationSchema);
exports.company_claim     = db.model( 'CompanyClaim', CompanyClaimSchema);
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
exports.forgot       = db.model( 'Forgot', ForgotSchema);
exports.notification = db.model( 'Notification', NotificationSchema );
// History
var history          = db.model( 'History' , HistorySchema );
exports.history      = history;
exports.feedback     = db.model( 'Feedback' , FeedbackSchema );
// Chat
exports.device       = db.model( 'Device', deviceSchema );
exports.pushevent    = db.model( 'PushEvent', PushEventSchema );
exports.push         = db.model( 'Push', PushSchema );
exports.online       = db.model( 'Online', OnlineSchema );
exports.conversation = db.model( 'Conversation' , ConversationSchema );
exports.message      = db.model( 'Message' , MessageSchema );
exports.log          = db.model( 'Log' , LogSchema );
// Localization
exports.city         = db.model('City', CiudadSchema);

//Email
exports.email        = db.model('Email', EmailSchema);