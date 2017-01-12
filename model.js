var mongoose   = require('mongoose');

mongoose.Promise = global.Promise;

var Schema     = mongoose.Schema,
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
HistorySchema.post('save', function(error, doc, next) {
  next();
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
    city: { type: Schema.Types.ObjectId, ref: 'City' },
    state: { type: Schema.Types.ObjectId, ref: 'State'}
  }
},{
  timestamps: true
});
profileSchema.post('save', function(error, doc, next) {
  next();
});
var deviceSchema = new Schema({
  token:   { type: String},
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  info: { type: Schema.Types.Mixed }
});
deviceSchema.post('save', function(err, doc, next){
  next();
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
ForgotSchema.post('save', function(error, doc, next) {
  next();
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
locationSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var CompanyClaimSchema = new Schema({
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' }
}, {
  timestamps: true
});
CompanyClaimSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var NetworkSchema = new Schema({
	accepted: Boolean,
	profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }]
},{
  timestamps: true
});
NetworkSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
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
companySchema.post('save', function(error, doc, next) {
  next();
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
experienceSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var OnlineSchema = new Schema({
  profiles: { type: Schema.Types.ObjectId, ref: 'Profile' },
  socket: { type: Schema.Types.Mixed }
},{
  timestamps: true
});
OnlineSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var ConversationSchema = new Schema({
  profiles: [ { type: Schema.Types.ObjectId, ref: 'Profile' } ],
  status: { type: String },
  message: { type: Schema.Types.ObjectId, ref: 'Message' }
},{
  timestamps: true
});
ConversationSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  message: { type: String }
},{
  timestamps: true
});
MessageSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var jobSchema = new Schema({
  name: String,
  type: Number,   // Profesion = 0 || Puesto = 1
  parent: { type: Schema.Types.ObjectId, ref: 'JobArea' }
},{
  timestamps: true
});
jobSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var jobAreaSchema = new Schema({
  name: String,
  id_data: Number,
  value: String
});
jobAreaSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var FeedbackSchema = new Schema({
	profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
	title: { type: String },
	content: { type: String }
},{
  timestamps: true
});
FeedbackSchema.post('save', function(error, doc, next) {
  next();
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
reviewSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var SearchSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  text: { type: String }
},{
  timestamps: true
});
SearchSchema.post('save', function(error, doc, next) {
  next();
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
sectorSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var skillsSchema = new Schema({
  name:   { type: String },
},{
  timestamps: true
});
skillsSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var specialitySchema = new Schema({
  name: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Job' }
},{
  timestamps: true
});
specialitySchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var tokenSchema = new Schema({  
  generated_id: { type: String},
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
},{
  timestamps: true
});
tokenSchema.post('save', function(error, doc, next) {
  next();
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
userSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var NotificationSchema = new Schema({
  tipo: Number, // 0 = se ha unido | 1 = recomendación | 2 = te recomiendan | 3 = Envio Solucitud | 4 = Respondio Solicitud
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_emisor: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_mensaje: { type: Schema.Types.ObjectId, ref: 'Profile' },
  busqueda: { type: Schema.Types.ObjectId, ref: 'History' },
  network: { type: Schema.Types.ObjectId, ref: 'Network' },
  clicked: false,
  status: false
},{
  timestamps: true
});
NotificationSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var LogSchema = new Schema({
  code: Number,
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  data: { type: Schema.Types.Mixed }
},{
  timestamps: true
});
LogSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var PaisSchema = new Schema({
  name: { type: String }
});
PaisSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var EstadoSchema = new Schema({
    "id" : { type: String },
    "key" : { type: String },
    "name" : { type: String },
    "shortname" : { type: String }
});
EstadoSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/
var CiudadSchema = new Schema({
    "id" : { type: String },
    "key" : { type: String },
    "state_id" : { type: Schema.Types.ObjectId, ref: 'State' },
    "name" : { type: String },
    "shortname" : { type: String }
});
CiudadSchema.post('save', function(error, doc, next) {
  next();
});
/*******************************************/

// Company
exports.company      = db.model( 'Company' , companySchema );
exports.experience   = db.model( 'Experience' , experienceSchema );
exports.job          = db.model( 'Job' , jobSchema );
exports.area         = db.model( 'JobArea' , jobAreaSchema );
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
exports.online       = db.model( 'Online', OnlineSchema );
exports.conversation = db.model( 'Conversation' , ConversationSchema );
exports.message      = db.model( 'Message' , MessageSchema );
exports.log          = db.model( 'Log' , LogSchema );
// Localization
exports.city       = db.model('City', CiudadSchema);
exports.state       = db.model('State', EstadoSchema);