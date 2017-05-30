/**
 * Schema de la Base de Datos.
 *
 * @module Model
 */
var mongoose        = require('mongoose');
mongoose.Promise    = global.Promise;
var Schema          = mongoose.Schema;
//var db_lnk        = 'mongodb://matus:pbv3GM4iYUDeMUWxQD54wsLwhInar4ssEDN7o0a1EUXrQ@192.168.33.10:27017/hive';
var db_lnk          = 'mongodb://localhost:27017/hive';
var db              = mongoose.createConnection(db_lnk);
/**
 * Creamos el Schema para guardar los movimientos en la Base de datos.
 *
 */
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
/**
 * Creamos el Schema para guardar las Noticias.
 * @param {Number}   id_numerico, Se creo para asignarselo a el App en Swift.
 * @param {ObjectId} profile_id, ID del Perfil donde se Mostrara la Noticia.
 * @param {ObjectId} de_id, ID del Perfil que crea la Noticia.
 * @param {String}   action, Tipo de Noticia. 1 = Noticia Creada por Usuario | 3 = Cambio de Puesto | 4 = Trabajaron juntos | 5 = Busca Recomendación.
 * @param {Mixed}    Contenido de la Noticia.
 *
 */
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
/**
 * Creamos el Schema para guardar las Noticias.
 * @param {String}       first_name          Nombre del Perfil.
 * @param {String}       last_name           Apellido del Perfil.
 * @param {String}       profile_pic         Imagen de Perfil
 * @param {String}       profile_hive        (***)
 * @param {String}       qrcode              Nombre del Archivo del QrCode en el servidor.
 * @param {Number}       status              Estado del Perfil.
 * @param {ObjectId}     user_id             ID del Usuario perteneciente a este Perfil.
 * @param {Date}         birthday            Fecha de Cumpleaños del Perfil.
 * @param {String}       facebookId          ID de Facebook.
 * @param {String}       facebookToken       token de Facebook.
 * @param {Mixed}        facebookData        Datos que Facebook te entrega.
 * @param {String}       lang                Lenguaje del Perfil (***)
 * @param {String}       phone               Teléfono del Perfil.
 * @param {[ObjectId]}   experiences         Id de Puesto/Empresa/Sector.
 * @param {[ObjectId]}   skills              Habilidades del Perfil.
 * @param {Mixed}        info                Información del Perfil. (***) Se penso para guardar datos extras.
 * @param {Mixed}        public_id           Id Publica para referenciar al Usuario.
 * @param {Array}        speciality          Arreglo, con datos de Especialidad. 
 * @param {ObjectId}        speciality.id    Id de la Especialidad de este Perfil.
 * @param {String}          speciality.name  Nombre de la Especialidad.Se agrega el nombre para esas veces donde no puedes obtener la especialidad desde el ID.
 * @param {String}       job                 Arreglo, con datos de la Ocupación.
 * @param {ObjectId}        job.id           Id de la Ocupación de este Perfil 
 * @param {String}          job.name         Nombre de la Ocupación.Se agrega el nombre para esas veces donde no puedes obtener la Ocupación desde el ID.
 * @param {Number}       review_score        Calificación promedio de este Perfil.
 * @param {Boolean}      block               Estado de Baneo del Perfil.
 * @param {Array}        location            Arreglo, con datos del lugar del Perfil.
 * @param {ObjectId}        location.city    ID de la Ciudad del Perfil.
 *
 */
var profileSchema = new Schema({
  first_name:     String,
  last_name:      String,
  profile_pic:    String,
  profile_hive:   String,
  qrcode:         String,
  status:         Number,
  user_id:        { type: Schema.Types.ObjectId, ref: 'User' },
  birthday:       { type: Date },
  facebookId:     { type: String},
  facebookToken:  { type: String },
  facebookData:   [{ type: Schema.Types.Mixed }],
  lang:           String,
  phone:          String,
  experiences:    [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
  skills:         [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
  info:           [{ type: Schema.Types.Mixed }],
  public_id:      { type: Schema.Types.Mixed },
  speciality:     {
                    id: { type: Schema.Types.ObjectId, ref: 'Speciality' },
                    name: String
                  },
  job:            {
                    id: { type: Schema.Types.ObjectId, ref: 'Job' },
                    name: String
                  },
  review_score:   { type: Number, default: 0 },
  block:          { type: Boolean },
  location:       {
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
profileSchema.post('remove', function(doc, next){
  logMiddleware("profile","remove", doc, function(err, logData){
    next();
  });
});
profileSchema.post('update', function(doc, next){
  logMiddleware("profile","update", doc, function(err, logData){
    next();
  });
});
/**
 * Creamos el Schema para guardar los Dispositivos.
 * @param {String}       token       Token Generado por el Servidor de Apple(IOS).
 * @param {String}       profile     Perfil al cual esta asignado este Dispositivo.
 * @param {Mixed}        active      Estado de este Dispositivo.
 *
 */
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
/**
 * Creamos el Schema para guardar los Codigo que se Generan para cambiar contraseñas.
 * @param {String}         generated_id   Token Generado por el Servidor de Apple(IOS).
 * @param {ObjectId}       user           Perfil al cual esta asignado este Dispositivo.
 * @param {Boolean}        used           Estado de este "Olvidar Contraseña".
 *
 */
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
/**
 * Creamos el Schema para la Colección Temporal para los usuarios en el Area de GPS de la Aplicación.
 * @param {String}         coordinates    Coordenadas a Guadar.
 * @param {ObjectId}       profile        Perfil al cual esta asignado esta coordenada.
 * @param {Boolean}        socket         Conexion hecha por Socket.IO desde el Dispositivo.
 *
 */
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
/**
 * Creamos el Schema para la Colección de las peticiones a Reclamar Empresa.
 * @param {ObjectId}       profile        Perfil a la cual esta asignado este reclamo.
 * @param {ObjectId}       company        Empresa a la cual esta asignada este reclamo.
 *
 */
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
/**
 * Creamos el Schema para la Colección de las Conexiones entre Perfiles. "Amistad".
 * @param {Boolean}          accepted        Estado de esta Conexion. True = Aceptado | False = Rechazado o No Interactuado.
 * @param {[ObjectId]}       profiles        Arreglo, Perfiles pertenecientes a esta Conexion.
 *
 */
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
/**
 * Creamos el Schema para la Colección para saber quien es el Creador de Cierta Empresa. A corto plazo esta Colección puede desaparecer.
 * @param {ObjectId}         company        Empresa asignada.
 * @param {ObjectId}         profile        Perfil Asignado.
 *
 */
var companyCreatorSchema = new Schema({
  company:{ type: Schema.Types.ObjectId, ref: 'Company' },
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' }
},{
  timestamps: true
});
companyCreatorSchema.post('save', function(doc, next){
  logMiddleware("company_creator","save", doc, function(err, logData){
    next();
  });
});
companyCreatorSchema.post('remove', function(doc, next){
  logMiddleware("company_creator","remove", doc, function(err, logData){
    next();
  });
});
companyCreatorSchema.post('update', function(doc, next){
  logMiddleware("company_creator","update", doc, function(err, logData){
    next();
  });
});
/**
 * Creamos el Schema para la Colección de las Empresas.
 * @param {Boolean}     name                 Nombre de la Empresa
 * @param {String}      images               Imagen de la Empresa (***) Se penso para insertarle un Logotipo
 * @param {String}      description          Texto para Describir a la Empresa. Maximo de 200 Caracteres.
 * @param {String}      website              URL de la pagina de la empresa.
 * @param {String}      phone                Telefóno de la Empresa.
 * @param {String}      type                 Grupo de la Empresa. (***) Este Campo no se usó.
 * @param {Array}       address              Dirección de la Empresa.
 * @param {String}         address.calle     Calle de la Empresa.
 * @param {String}         address.colonia   Colonia o Distrito.
 * @param {String}         address.ciudad    Ciudad donde esta la Empresa.
 * @param {String}         address.estado    Estado al que pertenece la Ciudad.
 * @param {String}         address.numero    Numero Interno o Externo.
 * @param {String}         address.postalc   Codigo Postal.
 * @param {ObjectId}    profile_id           Perfil que reclamó esta Empresa.
 *
 */
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
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
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
/**
 * Creamos el Schema para la Colección de los Puestos para el Perfil.
 * @param {Number}     type               Tipo de Experiencia. 0 = Independiente | 1 = Empresa
 * @param {Array}      ocupation          Arreglo, Ocupación de el Perfil.
 * @param {ObjectId}    ocupation.id      ID de la Ocupación.
 * @param {String}      ocupation.name    Nombre de la Ocupación.
 * @param {Array}      company            Arreglo, Empresa de el Perfil.
 * @param {ObjectId}    company.id        ID de la Empresa.
 * @param {String}      company.name      Nombre de la Empresa.
 * @param {Array}      sector             Arreglo, Nombre de el Sector de la Empresa.
 * @param {ObjectId}    sector.id         ID del Sector.
 * @param {String}      sector.name       Nombre del Sector de la Empresa.
 * @param {ObjectId}   profile_id         Perfil al que se le asigna esta "Experiencia".
 *
 */
var experienceSchema = new Schema({
  type: Number,
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
/**
 * Creamos el Schema para la Colección de los Perfiles En linea.
 * @param {String}         socket          ID del Socket.IO del dispositivo.
 * @param {ObjectId}       profile_id      Perfil al que se le asigna esta "Experiencia".
 *
 */
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
/**
 * Creamos el Schema para la Colección de Conversaciones para el Chat.
 * @param {[ObjectId]}     profiles       Perfiles Asignados a las Conversaciones.
 * @param {[Number]}       prop_status    Status(Eliminado) de la Conversación para cada Perfil. 2 = Active | 1 = Archive | 0 = Deleted
 * @param {[Boolean]}      readed         Status(Leido) de la Conversación para cada Perfil. true = leido || false = no leido
 * @param {ObjectId}       message        Ultimo Mensaje enviado en esta Conversación.
 * @param {Date}           order          La Fecha de el Ultimo Mensaje enviado, Esto sirve para ordenar las Conversaciones.
 *
 */
var ConversationSchema = new Schema({
  profiles:    [ { type: Schema.Types.ObjectId, ref: 'Profile' } ],
  prop_status: [{ type: Number }],
  readed: [{type: Boolean}],
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
  order: { type: Date }
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
/**
 * Creamos el Schema para la Colección de Conversaciones para el Chat.
 * @param {ObjectId}     conversation        ID de la conversacion a la que pertenece el mensaje.
 * @param {ObjectId}       profile_id        ID de el Perfil que envio el mensaje.
 * @param {[Boolean]}      type              Tipo de Mensaje. 0 = Texto | 1 = Imagen.
 * @param {ObjectId}       message           Texto enviado en el mensaje.
 * @param {Date}           status            Estado(Leido).
 *
 */
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
/**
 * Creamos el Schema para la Colección de los Puestos/Profesiones.
 * @param {String}       name        ID de la conversacion a la que pertenece el mensaje.
 * @param {Number}       type        Tipo de Trabajo. 0 = Profesion | 1 = Puesto.
 * @param {ObjectId}     parent      Id del Sector al que pertenece este Puesto/Profesion.
 *
 */
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
/**
 * Creamos el Schema para la Colección de Comentarios de la Aplicación.
 * @param {ObjectId}     profile_id        ID del Perfil que Envio el Comentario.
 * @param {[Boolean]}    content           Comentario.
 *
 */
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
/**
 * Creamos el Schema para la Colección de Comentarios de la Aplicación.
 * @param {ObjectId}     profile_id        ID del Perfil que Envio el Comentario.
 * @param {[Boolean]}    content           Comentario.
 *
 */
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
/**
 * Creamos el Schema para Guardar las busquedas hechas por el Usuario.
 * @param {ObjectId}     profile_id        ID del Perfil que Envio al que le guardas el texto.
 * @param {String}       text              Texto Buscado.
 *
 */
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
/**
 * Creamos el Schema para la Colección de los Sectores de los Puestos.
 * @param {String}       name              Nombre de el Sector.
 * @param {String}       description       Descripción del Sector. (***) Se penso para describir el Sector.
 * @param {String}       industry          Nombre para Agrupar los Sectores (***) Se penso para agruparlos. (Medicina|Ingenieria|Agricultura)
 *
 */
var sectorSchema = new Schema({
  name:  String,
  description: String,
  industry: String
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
/**
 * Creamos el Schema para la Colección Habilidades.
 * @param {String}       name              Nombre de la Habilidad.
 *
 */
var skillsSchema = new Schema({
  name:   { type: String }
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
/**
 * Creamos el Schema para la Colección Especialidades.
 * @param {String}       name              Nombre de la Especialidad.
 * @param {ObjectId}     parent            Profesion de la Especialización.
 *
 */
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
/**
 * Creamos el Schema para la Colección que guarda los token, para los permisos.
 * @param {String}       generated_id      Hash creado para el App. Se usa en la mayoria de las peticiones.
 * @param {ObjectId}     user_id           Usuario al que se le asignó este permiso.
 *
 */
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
/**
 * Creamos el Schema para la Colección que guarda los datos de usuario.
 * @param {String}       email          Correo de la cuenta.
 * @param {ObjectId}     password       Contraseña de la Cuenta. Usa sha1 para generar la contraseña.
 * @param {ObjectId}     verified       Estado de la Cuenta. False = No Verificado | True = Verificado
 * @param {ObjectId}     type           Tipo de Usuario, si fue creado por Email y Password o por Login de Facebook. 0 = Normal User || 1 = Facebook User
 *
 */
var userSchema = new Schema({
  email: { type: String },
  password: { type: String },
  verified: { type: Boolean},
  type: { type: Number }   // 
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

/**
 * Creamos el Schema para la Colección que guarda las Notificaciones de los Usuarios.
 * @param {Number}       tipo               El tipo de Notificación. -1 = Test | 0 = se ha unido | 1 = recomendación | 2 = te recomiendan | 3 = Envio Solucitud | 4 = Respondio Solicitud | 5 = Review   
 * @param {ObjectId}     profile            ID del Perfil al que le enviaron la Notificación.
 * @param {ObjectId}     profile_emisor     ID del Perfil que envio la Notificación.
 * @param {ObjectId}     profile_mensaje    ID del Perfil que se esta recomendando. 
 * @param {ObjectId}     busqueda           ID de la Noticia para pedir una recomendación.
 * @param {ObjectId}     network            ID de la Conexion a Amigos.
 * @param {ObjectId}     review             ID de la Reseña.
 * @param {Boolean}      clicked            Status de Interacción con la Notificación.
 * @param {Boolean}      status             Status de la Notificación y la Busqueda/Conexion/Reseña
 * @param {Boolean}      deleted            Visto/Oculto
 *
 */
var NotificationSchema = new Schema({
  tipo: Number, 
  
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_emisor: { type: Schema.Types.ObjectId, ref: 'Profile' },
  profile_mensaje: { type: Schema.Types.ObjectId, ref: 'Profile' },

  busqueda: { type: Schema.Types.ObjectId, ref: 'History' },
  network: { type: Schema.Types.ObjectId, ref: 'Network' },
  review: { type: Schema.Types.ObjectId, ref: 'Review' },
  
  clicked: { type: Boolean, default: false},
  status: { type: Boolean, default: false},
  deleted: { type: Boolean, default: false }
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
var GlosarySchema = new Schema({
  "text": String,
  "replace": String,
  "extra": { type: Schema.Types.Mixed }
}, {
  timestamps: true
});
GlosarySchema.post('save', function(doc, next){
  logMiddleware("glosary","save", doc, function(err, logData){
    next();
  });
});
GlosarySchema.post('remove', function(doc, next){
  logMiddleware("glosary","remove", doc, function(err, logData){
    next();
  });
});
GlosarySchema.post('update', function(doc, next){
  logMiddleware("glosary","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/

var VersionSchema = new Schema({
  device: { type: Schema.Types.ObjectId, ref: 'Device'},
  bundle_id: String,
  bundle_version: String,
  bundle_app_file: String,
  device_width: String,
  device_height: String,
});
VersionSchema.post('save', function(doc, next){
  logMiddleware("version","save", doc, function(err, logData){
    next();
  });
});
VersionSchema.post('remove', function(doc, next){
  logMiddleware("version","remove", doc, function(err, logData){
    next();
  });
});
VersionSchema.post('update', function(doc, next){
  logMiddleware("version","update", doc, function(err, logData){
    next();
  });
});
/*******************************************/
// Experience
exports.company      = db.model( 'Company',           companySchema );
exports.comp_creator = db.model('CompanyCreator',     companyCreatorSchema);
exports.experience   = db.model( 'Experience',        experienceSchema );
exports.job          = db.model( 'Job',               jobSchema );
exports.location     = db.model( 'GPS',               locationSchema);
exports.company_claim     = db.model( 'CompanyClaim', CompanyClaimSchema);
exports.skill        = db.model( 'Skill',             skillsSchema );
exports.speciality   = db.model( 'Speciality',        specialitySchema );
exports.sector       = db.model( 'Sector',            sectorSchema );
// Profile
exports.profile      = db.model( 'Profile',           profileSchema );
exports.network      = db.model( 'Network',           NetworkSchema );
exports.review       = db.model( 'Review',            reviewSchema );
exports.search       = db.model( 'Search',            SearchSchema );
exports.token        = db.model( 'Token',             tokenSchema );
exports.user         = db.model( 'User',              userSchema );
exports.forgot       = db.model( 'Forgot',            ForgotSchema);
exports.notification = db.model( 'Notification',      NotificationSchema );
// History
var history          = db.model( 'History',           HistorySchema );
exports.history      = history;
exports.feedback     = db.model( 'Feedback',          FeedbackSchema );
// Chat
exports.version      = db.model( 'Version',           VersionSchema );
exports.device       = db.model( 'Device',            deviceSchema );
exports.pushevent    = db.model( 'PushEvent',         PushEventSchema );
exports.push         = db.model( 'Push',              PushSchema );
exports.online       = db.model( 'Online',            OnlineSchema );
exports.conversation = db.model( 'Conversation',      ConversationSchema );
exports.message      = db.model( 'Message',           MessageSchema );
exports.log          = db.model( 'Log',               LogSchema );
// Localization
exports.city         = db.model('City',               CiudadSchema);
exports.pais         = db.model('Pais',               PaisSchema);
//Email
exports.email        = db.model('Email',              EmailSchema);
exports.glosary      = db.model('Glosary',            GlosarySchema);