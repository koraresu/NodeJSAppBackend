var express = require('express');

var mongoose    = require('mongoose');
var router = express.Router();
var _jade = require('jade');
var fs = require('fs');
var async = require('async');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var model = require('../model');
var Profile     = model.profile;
var User        = model.user;
var Token       = model.token;
var Job         = model.job;
var Company     = model.company;
var Experience  = model.experience;
var Network     = model.network;
var History     = model.history;
var Feedback    = model.feedback;
var Review      = model.review;
var Log         = model.log;
var Forgot      = model.forgot;
var Skill       = model.skill;
var Speciality  = model.speciality;
var Sector      = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Profilefunc = require('../functions/profilefunc');
var Generalfunc = require('../functions/generalfunc');
var Notificationfunc = require('../functions/notificationfunc');

var apnProvider = Generalfunc.apnProvider();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/bienvenida/:id', function(req, res){
  var id = req.params.id;

  if(mongoose.Types.ObjectId.isValid(id)){
    id = mongoose.Types.ObjectId(id);


    Profile.findOne({ public_id: id }).populate('user_id').exec( function(errProfile, profileData){
      if(!errProfile && profileData){
        res.render('email_bienvenida', { nombre: profileData.first_name, public_id: profileData.public_id });
      }
    });
  }
})
router.get('/email/forgot/:id', function(req, res){
  res.render('emailforgot', {
    nombre: "Jose ",
    generated_id: req.params.id
  });
});
router.get('/unsubscribe', function(req, res){
  res.render('unsubscribe',{});
});
router.get('/email/invite', function(req, res){
  res.render('emailinvite', {
    email: "rkenshin21@gmail.com",
    nombre_invita: "Esteban Moldovan",
    email_invita:  "esteban@thehive.com"
  });
});
router.get('/verification/:id',function(req, res){
	var id = req.params.id;

  if(mongoose.Types.ObjectId.isValid(id)){
    id = mongoose.Types.ObjectId(id);


    Profile.findOne({ public_id: id }).populate('user_id').exec( function(errProfile, profileData){
      if(!errProfile && profileData){
          console.log(profileData.user_id);

          if(profileData.user_id == null){
            res.render('verified', { email: "", status: false, message: "El usuario que estas buscando no existe"});
          }else{
          profileData.user_id.verified = true;
          profileData.user_id.save(function(errUser, userData){


            Generalfunc.sendEmail("email_bienvenida.jade", {
              public_id: profileData.public_id,
              nombre: profileData.first_name,
            }, userData.email, "¡Bienvenido a la Colmena!",function(status, html){
              if(status){
                res.render('verified', { email: userData.email, status: true });
              }else{
                res.render('verified', { email: userData.email, status: false, message: "Error al enviar el correo de bienvenida" });
              }     
            });
          });
        }
      }else{
        res.render('verified', { email: userData.email, status: false, message: "El usuario que estas buscando no existe"});
      }
    });
  }else{
    res.render('verified', { email: userData.email, status: false, message: "El usuario que estas buscando no existe"});
  }
  	
});
router.get('/city/list', function(req, res){
  City.find({}).populate('state_id', '_id name').exec(function(err, cityData){
    res.json(cityData);
  });
});
router.get('/city', function(req, res){
  City.find({}).exec(function(err, cityData){
    cityData.forEach(function(cityItem, cityIndex){
      State.findOne({
        _id: cityItem.state_id
      }).exec(function(errState, stateData){
        if(!errState && stateData){
          cityItem.state_id = mongoose.Types.ObjectId(stateData._id);
          cityItem.save(function(err, city){
            console.log(cityIndex);
            console.log(cityData.length);

            if(cityIndex+1 == cityData.length){
              res.send("Ya esta!!");
            }
          });
        }
      });
    });
  });

});

router.get('/forgot/:generated', function(req, res){
  var generated_id = req.params.generated;

  var password_again = req.flash('password_again');

  console.log(password_again);
  Forgot.findOne({ generated_id: generated_id }).populate('user').exec(function(err, forgotData){
    if(!err && forgotData){
      if(forgotData.used == false){
        Profile.findOne({ user_id: forgotData.user._id }).exec(function(err, profileData){
          res.render('forgot',{ message: password_again, generated: generated_id, email: forgotData.user.email,nombre: profileData.first_name+" "+profileData.last_name });
        });    
      }else{
        res.render('forgot_thanks',{ message: "Tu contraseña ya ha sido actualizada", icon: "right.png" });
      }
    }else{
      res.render('forgot_thanks',{ message:"Error", icon: "wrong.png" });
    }
  });    
});
router.post('/forgot/thanks', function(req, res){
  console.log(req.body);

  var generated      = req.body.generated;
  var password       = req.body.password;
  var password_again = req.body.password_again;
  
  if(password == password_again){
    console.log("Password Iguales");

    Forgot.findOne({ generated_id: generated }).populate('user').exec(function(err, forgotData){
      forgotData.used = true;
      forgotData.save(function(err, forgot){
        Profile.findOne({ user_id: forgotData.user._id }).exec(function(err, profileData){

          User.findOne({ _id: forgotData.user._id }).exec(function(err, userData){
            var pass = Profilefunc.generate_password(password);
            userData.password = pass;
            userData.save(function(err, user){
              if(!err && user){
                res.render('forgot_thanks',{ message: "Tu contraseña ha sido actualizada", icon: "right.png", generated: generated });  
              }else{
                res.render('forgot_thanks',{ message: "Un error ha sucedido.", icon: "right.png", generated: generated });
              }
              
            });
          });

          
        });
      });
    });  
  }else{
    console.log("Password Diferentes");

    req.flash('password_again', 'Tu contraseña y validacion de contraseña no son iguales.');
    res.redirect('/forgot/'+generated);
  }
});
router.get('/gps', function(req, res){
  res.render('gps', {} );
});
router.get('/gps2', function(req, res){
  res.render('gps2', {} );
});
router.get('/chat/2', function(req, res){
  res.render('chat2', {});
});
router.get('/chat/1', function(req, res){
  res.render('chat1', {});
});
router.get('/chat/3', function(req, res){
  res.render('chat3', {});
});



router.get('/check/history', function(req, res){
  var html = "";
  History.find({}).exec(function(errExperience, historyData){
    var html = "";
    async.map(historyData, function(item, callback){
      var h = "";  
      h += '<p style="border-bottom: 1px solid #000;">' + item.action + " | ";
      switch(item.action){
        case "1":
          h += item.data.title + " - " + item.data.content;
        break;
        case "2":
          h += "";
        break;
        case "3":
          h += "";
        break;
        case "4":
          if(item.data != undefined){
            if(item.data.busqueda != undefined){
              h += item.data.busqueda;    
            }
          }
        break;
        case "5":
          h += "";
        break;
        case "6":
          if(item.data != undefined){
            if(item.data.name != undefined){
              h += item.data.name;    
            }
          }
        break;
        case "7":
          h += "[" + item.data.rate + "] " + item.data.title + " | " + item.data.content;
        break;
      }
      Profile.findOne({_id: item.profile_id}).exec(function(errProfile, profileData){
        if(!errProfile && profileData){
          h += '<p style="background-color:green;">' + profileData._id + " - " + profileData.first_name + " " + profileData.last_name + " - Existe</p>";
        }else{
          h += '<p style="background-color:gray;">' + item._id + " - NoExiste</p>";
        }
        h += "</p>";

        callback(null, h);
      });
    },function(err, results){
      html = results.join("");

      res.send(html);
    });
    
  });

});
router.get('/jobs/db', function(req, res){
  var x = [
  {
    "id": 1,
    "name": "Administrativos",
    "subcat": [{
      "parent": 1,
      "id": 1,
      "name": "Administración de Oficina"
    }, {
      "parent": 1,
      "id": 2,
      "name": "Administración de Riesgo"
    }, {
      "parent": 1,
      "id": 3,
      "name": "Administración de seguros y fianzas"
    }, {
      "parent": 1,
      "id": 4,
      "name": "Administración General"
    }, {
      "parent": 1,
      "id": 5,
      "name": "Archivista y manejo de documentación"
    }, {
      "parent": 1,
      "id": 6,
      "name": "Auxiliar Administrativo"
    }, {
      "parent": 1,
      "id": 7,
      "name": "Ayudante General"
    }, {
      "parent": 1,
      "id": 8,
      "name": "Compras"
    }, {
      "parent": 1,
      "id": 9,
      "name": "Crédito y cobranzas "
    }, {
      "parent": 1,
      "id": 10,
      "name": "Dirección "
    }, {
      "parent": 1,
      "id": 11,
      "name": "Dirección General"
    }, {
      "parent": 1,
      "id": 12,
      "name": "Economía"
    }, {
      "parent": 1,
      "id": 13,
      "name": "Planeación Estratégica"
    }, {
      "parent": 1,
      "id": 14,
      "name": "Planeación Financiera"
    }, {
      "parent": 1,
      "id": 15,
      "name": "Recepcionista y Operador"
    }, {
      "parent": 1,
      "id": 16,
      "name": "Relaciones Industriales"
    }, {
      "parent": 1,
      "id": 17,
      "name": "Secretaria"
    }, {
      "parent": 1,
      "id": 18,
      "name": "Servicio"
    }, {
      "parent": 1,
      "id": 19,
      "name": "Trading"
    }]},
  {
    "id": 2,
    "name": "Biología",
    "subcat": [{
      "parent": 2,
      "id": 20,
      "name": "Análisis Geológico y del Medio Ambiente"
    }, {
      "parent": 2,
      "id": 21,
      "name": "Dirección "
    }, {
      "parent": 2,
      "id": 22,
      "name": "Dirección General"
    }, {
      "parent": 2,
      "id": 23,
      "name": "Investigación biológica"
    }, {
      "parent": 2,
      "id": 24,
      "name": "Investigación química"
    }, {
      "parent": 2,
      "id": 25,
      "name": "Investigación y Desarrollo"
    }, {
      "parent": 2,
      "id": 26,
      "name": "Química y bioquímica"
    }]},
  {
    "id": 3,
    "name": "Comunicaciones",
    "subcat": [{
      "parent": 3,
      "id": 27,
      "name": "Comunicación e Imagen"
    }, {
      "parent": 3,
      "id": 28,
      "name": "Dirección"
    }, {
      "parent": 3,
      "id": 29,
      "name": "Dirección de Arte"
    }, {
      "parent": 3,
      "id": 30,
      "name": "Dirección General"
    }, {
      "parent": 3,
      "id": 31,
      "name": "Diseñador Gráfico"
    }, {
      "parent": 3,
      "id": 32,
      "name": "Editor"
    }, {
      "parent": 3,
      "id": 33,
      "name": "Periodismo"
    }, {
      "parent": 3,
      "id": 34,
      "name": "Productor Audiovisual"
    }, {
      "parent": 3,
      "id": 35,
      "name": "Productor Gráfico"
    }, {
      "parent": 3,
      "id": 36,
      "name": "Redactor"
    }]},
  {
    "id": 4,
    "name": "Construcción",
    "subcat": [{
      "parent": 4,
      "id": 37,
      "name": "Administración de obra"
    }, {
      "parent": 4,
      "id": 38,
      "name": "Dirección de Obra"
    }, {
      "parent": 4,
      "id": 39,
      "name": "Diseño Arquitectónico y estructural"
    }, {
      "parent": 4,
      "id": 40,
      "name": "Diseño de interiores"
    }, {
      "parent": 4,
      "id": 41,
      "name": "Especialista en Urbanismo"
    }, {
      "parent": 4,
      "id": 42,
      "name": "Oficios calificados (electricista, herrero, plomero, pintor, etc.)"
    }, {
      "parent": 4,
      "id": 43,
      "name": "Operador de equipo pesado"
    }, {
      "parent": 4,
      "id": 44,
      "name": "Superintendente de obra"
    }, {
      "parent": 4,
      "id": 45,
      "name": "Supervisor instalaciones e infraestructura"
    }]},
  {
    "id": 5,
    "name": "Contabilidad",
    "subcat": [{
      "parent": 5,
      "id": 46,
      "name": "Administración de inmuebles y activos fijos"
    }, {
      "parent": 5,
      "id": 47,
      "name": "Análisis actuarial"
    }, {
      "parent": 5,
      "id": 48,
      "name": "Análisis financiero / pronósticos"
    }, {
      "parent": 5,
      "id": 49,
      "name": "Auditoría"
    }, {
      "parent": 5,
      "id": 50,
      "name": "Auxiliar Contable"
    }, {
      "parent": 5,
      "id": 51,
      "name": "Banca"
    }, {
      "parent": 5,
      "id": 52,
      "name": "Contabilidad / finanzas / sector financiero"
    }, {
      "parent": 5,
      "id": 53,
      "name": "Contabilidad de costos / inventarios"
    }, {
      "parent": 5,
      "id": 54,
      "name": "Contabilidad General"
    }, {
      "parent": 5,
      "id": 55,
      "name": "Contraloría"
    }, {
      "parent": 5,
      "id": 56,
      "name": "Crédito y cobranzas"
    }, {
      "parent": 5,
      "id": 57,
      "name": "Cuentas por pagar"
    }, {
      "parent": 5,
      "id": 58,
      "name": "Facturación"
    }, {
      "parent": 5,
      "id": 59,
      "name": "Finanzas corporativas"
    }, {
      "parent": 5,
      "id": 60,
      "name": "Fusiones y Adquisiciones"
    }, {
      "parent": 5,
      "id": 61,
      "name": "Impuestos"
    }, {
      "parent": 5,
      "id": 62,
      "name": "Mercado de cambios"
    }, {
      "parent": 5,
      "id": 63,
      "name": "Mercados financieros / inversiones"
    }, {
      "parent": 5,
      "id": 64,
      "name": "Tesorería y bancos"
    }]},
  {
    "id": 6,
    "name": "Creatividad, Producción y Diseño Comercial",
    "subcat": [{
      "parent": 6,
      "id": 65,
      "name": "Animación por Computadora"
    }, {
      "parent": 6,
      "id": 66,
      "name": "Arquitectura y Diseño de Interiores"
    }, {
      "parent": 6,
      "id": 67,
      "name": "Artes Creativas"
    }, {
      "parent": 6,
      "id": 68,
      "name": "Dirección"
    }, {
      "parent": 6,
      "id": 69,
      "name": "Dirección Creativo"
    }, {
      "parent": 6,
      "id": 70,
      "name": "Dirección de Arte"
    }, {
      "parent": 6,
      "id": 71,
      "name": "Dirección General"
    }, {
      "parent": 6,
      "id": 72,
      "name": "Diseñador Gráfico"
    }, {
      "parent": 6,
      "id": 73,
      "name": "Diseñador Industrial"
    }, {
      "parent": 6,
      "id": 74,
      "name": "Diseñadores web y/o digitales"
    }, {
      "parent": 6,
      "id": 75,
      "name": "Editor"
    }, {
      "parent": 6,
      "id": 76,
      "name": "Escenógrafo"
    }, {
      "parent": 6,
      "id": 77,
      "name": "Fotógrafo"
    }, {
      "parent": 6,
      "id": 78,
      "name": "Ilustrador"
    }, {
      "parent": 6,
      "id": 79,
      "name": "Músico"
    }, {
      "parent": 6,
      "id": 80,
      "name": "Productor Audiovisual"
    }, {
      "parent": 6,
      "id": 81,
      "name": "Productor Gráfico"
    }, {
      "parent": 6,
      "id": 82,
      "name": "Redactor"
    }, {
      "parent": 6,
      "id": 83,
      "name": "Traducción"
    }]},
  {
    "id": 7,
    "name": "Derecho y Leyes",
    "subcat": [{
      "parent": 7,
      "id": 84,
      "name": "Derecho Civil"
    }, {
      "parent": 7,
      "id": 85,
      "name": "Derecho Corporativo"
    }, {
      "parent": 7,
      "id": 86,
      "name": "Derecho Fiscal"
    }, {
      "parent": 7,
      "id": 87,
      "name": "Derecho Laboral"
    }, {
      "parent": 7,
      "id": 88,
      "name": "Derecho Mercantil"
    }, {
      "parent": 7,
      "id": 89,
      "name": "Derecho Notarial"
    }, {
      "parent": 7,
      "id": 90,
      "name": "Derecho Penal"
    }, {
      "parent": 7,
      "id": 91,
      "name": "Dirección"
    }, {
      "parent": 7,
      "id": 92,
      "name": "Jurídico"
    }, {
      "parent": 7,
      "id": 93,
      "name": "Leyes/Derecho"
    }]},
  {
    "id": 8,
    "name": "Educación",
    "subcat": [{
      "parent": 8,
      "id": 94,
      "name": "Dirección"
    }, {
      "parent": 8,
      "id": 95,
      "name": "Educación Especial"
    }, {
      "parent": 8,
      "id": 96,
      "name": "Educador"
    }, {
      "parent": 8,
      "id": 97,
      "name": "Gestión y Administración"
    }, {
      "parent": 8,
      "id": 98,
      "name": "Idiomas"
    }, {
      "parent": 8,
      "id": 99,
      "name": "Profesor Bachillerato o Preparatoria"
    }, {
      "parent": 8,
      "id": 100,
      "name": "Profesor de Educación Física"
    }, {
      "parent": 8,
      "id": 101,
      "name": "Profesor Primaria"
    }, {
      "parent": 8,
      "id": 102,
      "name": "Profesor Secundaria"
    }, {
      "parent": 8,
      "id": 103,
      "name": "Profesor Universitario"
    }, {
      "parent": 8,
      "id": 104,
      "name": "Psicopedagogo"
    }]},
  {
    "id": 9,
    "name": "Ingeniería",
    "subcat": [{
      "parent": 9,
      "id": 105,
      "name": "Agronomía"
    }, {
      "parent": 9,
      "id": 106,
      "name": "Alimentos / Ingeniería"
    }, {
      "parent": 9,
      "id": 107,
      "name": "Análisis de Elementos Finitos"
    }, {
      "parent": 9,
      "id": 108,
      "name": "Automatización"
    }, {
      "parent": 9,
      "id": 109,
      "name": "Consultor en Ingeniería"
    }, {
      "parent": 9,
      "id": 110,
      "name": "Dirección"
    }, {
      "parent": 9,
      "id": 111,
      "name": "Dirección General"
    }, {
      "parent": 9,
      "id": 112,
      "name": "Diseño Mecánico"
    }, {
      "parent": 9,
      "id": 113,
      "name": "Ingeniería Aeronáutica"
    }, {
      "parent": 9,
      "id": 114,
      "name": "Ingeniería Agrónoma"
    }, {
      "parent": 9,
      "id": 115,
      "name": "Ingeniería Automotriz"
    }, {
      "parent": 9,
      "id": 116,
      "name": "Ingeniería Civil"
    }, {
      "parent": 9,
      "id": 117,
      "name": "Ingeniería de Mantenimiento"
    }, {
      "parent": 9,
      "id": 118,
      "name": "Ingeniería de Materiales"
    }, {
      "parent": 9,
      "id": 119,
      "name": "Ingeniería de Materiales / Fundición"
    }, {
      "parent": 9,
      "id": 120,
      "name": "Ingeniería de Materiales / Metalurgia"
    }, {
      "parent": 9,
      "id": 121,
      "name": "Ingeniería de Procesos"
    }, {
      "parent": 9,
      "id": 122,
      "name": "Ingeniería de Producción y Manufactura"
    }, {
      "parent": 9,
      "id": 123,
      "name": "Ingeniería Eléctrica"
    }, {
      "parent": 9,
      "id": 124,
      "name": "Ingeniería Electromecánica"
    }, {
      "parent": 9,
      "id": 125,
      "name": "Ingeniería Electrónica"
    }, {
      "parent": 9,
      "id": 126,
      "name": "Ingeniería en Alimentos"
    }, {
      "parent": 9,
      "id": 127,
      "name": "Ingeniería en General"
    }, {
      "parent": 9,
      "id": 128,
      "name": "Ingeniería Industrial"
    }, {
      "parent": 9,
      "id": 129,
      "name": "Ingeniería Mecánica"
    }, {
      "parent": 9,
      "id": 130,
      "name": "Ingeniería Química"
    }, {
      "parent": 9,
      "id": 131,
      "name": "Ingeniería Textil"
    }, {
      "parent": 9,
      "id": 132,
      "name": "Investigación y Desarrollo"
    }, {
      "parent": 9,
      "id": 133,
      "name": "Máquinas y Herramientas"
    }, {
      "parent": 9,
      "id": 134,
      "name": "Mecánico de motores y planeadores"
    }, {
      "parent": 9,
      "id": 135,
      "name": "Mecánico de reparaciones estructurales"
    }, {
      "parent": 9,
      "id": 136,
      "name": "Mejora Continua"
    }, {
      "parent": 9,
      "id": 137,
      "name": "Robótica"
    }]},
  {
    "id": 10,
    "name": "Logística, Transportación y Distribución",
    "subcat": [{
      "parent": 10,
      "id": 138,
      "name": "Abastecimientos"
    }, {
      "parent": 10,
      "id": 139,
      "name": "Aduanas"
    }, {
      "parent": 10,
      "id": 140,
      "name": "Almacén, Inventarios"
    }, {
      "parent": 10,
      "id": 141,
      "name": "Chofer, montacargas"
    }, {
      "parent": 10,
      "id": 142,
      "name": "Comercio Exterior, Importaciones/Exportaciones"
    }, {
      "parent": 10,
      "id": 143,
      "name": "Dirección"
    }, {
      "parent": 10,
      "id": 144,
      "name": "Dirección General"
    }, {
      "parent": 10,
      "id": 145,
      "name": "Embarque y distribución Logística"
    }, {
      "parent": 10,
      "id": 146,
      "name": "Embarque y distribución Logística / Distribución"
    }, {
      "parent": 10,
      "id": 147,
      "name": "Embarque y distribución Logística / Tráfico"
    }, {
      "parent": 10,
      "id": 148,
      "name": "Mensajería"
    }, {
      "parent": 10,
      "id": 149,
      "name": "Transporte y Carga"
    }]},
  {
    "id": 11,
    "name": "Manufactura, Producción y Operación",
    "subcat": [{
      "parent": 11,
      "id": 150,
      "name": "Administración de la Planta Productiva"
    }, {
      "parent": 11,
      "id": 151,
      "name": "Control de Calidad"
    }, {
      "parent": 11,
      "id": 152,
      "name": "Control de Materiales"
    }, {
      "parent": 11,
      "id": 153,
      "name": "Control de Producción"
    }, {
      "parent": 11,
      "id": 154,
      "name": "Dirección"
    }, {
      "parent": 11,
      "id": 155,
      "name": "Dirección General"
    }, {
      "parent": 11,
      "id": 156,
      "name": "Ingeniería de Planta"
    }, {
      "parent": 11,
      "id": 157,
      "name": "Investigación y Desarrollo"
    }, {
      "parent": 11,
      "id": 158,
      "name": "Mantenimiento"
    }, {
      "parent": 11,
      "id": 159,
      "name": "Mantenimiento eléctrico"
    }, {
      "parent": 11,
      "id": 160,
      "name": "Mantenimiento electrónico"
    }, {
      "parent": 11,
      "id": 161,
      "name": "Mantenimiento mecánico"
    }, {
      "parent": 11,
      "id": 162,
      "name": "Manufactura"
    }, {
      "parent": 11,
      "id": 163,
      "name": "Operaciones"
    }, {
      "parent": 11,
      "id": 164,
      "name": "Prosec"
    }, {
      "parent": 11,
      "id": 165,
      "name": "Supervisor de Piso"
    }]},
  {
    "id": 12,
    "name": "Mercadotecnia, Publicidad y Relaciones Públicas",
    "subcat": [{
      "parent": 12,
      "id": 166,
      "name": "Dirección"
    }, {
      "parent": 12,
      "id": 167,
      "name": "Dirección General"
    }, {
      "parent": 12,
      "id": 168,
      "name": "Gerencia de Mercadotecnia"
    }, {
      "parent": 12,
      "id": 169,
      "name": "Gerencia de Producción"
    }, {
      "parent": 12,
      "id": 170,
      "name": "Gerencia de Producto"
    }, {
      "parent": 12,
      "id": 171,
      "name": "Investigación y Análisis de Mercado"
    }, {
      "parent": 12,
      "id": 172,
      "name": "Mercadotecnia de Eventos"
    }, {
      "parent": 12,
      "id": 173,
      "name": "Mercadotecnia Directa"
    }, {
      "parent": 12,
      "id": 174,
      "name": "Mercadotecnia y Publicidad"
    }, {
      "parent": 12,
      "id": 175,
      "name": "Planeación de Medios"
    }, {
      "parent": 12,
      "id": 176,
      "name": "Producción Audiovisual y Digital"
    }, {
      "parent": 12,
      "id": 177,
      "name": "Publicidad"
    }, {
      "parent": 12,
      "id": 178,
      "name": "Relaciones Internacionales"
    }, {
      "parent": 12,
      "id": 179,
      "name": "Relaciones Públicas"
    }, {
      "parent": 12,
      "id": 180,
      "name": "Soporte de Ventas"
    }, {
      "parent": 12,
      "id": 181,
      "name": "Telemarketing"
    }]},
  {
    "id": 13,
    "name": "Recursos Humanos",
    "subcat": [{
      "parent": 13,
      "id": 182,
      "name": "Administración de Personal"
    }, {
      "parent": 13,
      "id": 183,
      "name": "Capacitación y Desarrollo"
    }, {
      "parent": 13,
      "id": 184,
      "name": "Compensaciones y Beneficios"
    }, {
      "parent": 13,
      "id": 185,
      "name": "Consultoría en Recursos Humanos"
    }, {
      "parent": 13,
      "id": 186,
      "name": "Dirección"
    }, {
      "parent": 13,
      "id": 187,
      "name": "Nómina"
    }, {
      "parent": 13,
      "id": 188,
      "name": "Reclutamiento y Selección de Personal"
    }, {
      "parent": 13,
      "id": 189,
      "name": "Recursos Humanos"
    }, {
      "parent": 13,
      "id": 190,
      "name": "Relaciones Laborales"
    }, {
      "parent": 13,
      "id": 191,
      "name": "Seguridad "
    }]},
  {
    "id": 14,
    "name": "Salud y Belleza",
    "subcat": [{
      "parent": 14,
      "id": 192,
      "name": "Estilista"
    }, {
      "parent": 14,
      "id": 193,
      "name": "Instructor Deportivo"
    }, {
      "parent": 14,
      "id": 194,
      "name": "Manicurista"
    }, {
      "parent": 14,
      "id": 195,
      "name": "Masajista"
    }, {
      "parent": 14,
      "id": 196,
      "name": "Pedicurista"
    }, {
      "parent": 14,
      "id": 197,
      "name": "Spa"
    }, {
      "parent": 14,
      "id": 198,
      "name": "Terapeuta"
    }]},
  {
    "id": 15,
    "name": "Sector Salud",
    "subcat": [{
      "parent": 15,
      "id": 199,
      "name": "Dentista"
    }, {
      "parent": 15,
      "id": 200,
      "name": "Dirección"
    }, {
      "parent": 15,
      "id": 201,
      "name": "Dirección General"
    }, {
      "parent": 15,
      "id": 202,
      "name": "Ecología"
    }, {
      "parent": 15,
      "id": 203,
      "name": "Enfermería"
    }, {
      "parent": 15,
      "id": 204,
      "name": "Farmacéutica"
    }, {
      "parent": 15,
      "id": 205,
      "name": "Laboratorio/Patología"
    }, {
      "parent": 15,
      "id": 206,
      "name": "Medicina"
    }, {
      "parent": 15,
      "id": 207,
      "name": "Medicina del Deporte"
    }, {
      "parent": 15,
      "id": 208,
      "name": "Nutrición"
    }, {
      "parent": 15,
      "id": 209,
      "name": "Oftalmología"
    }, {
      "parent": 15,
      "id": 210,
      "name": "Rehabilitación"
    }, {
      "parent": 15,
      "id": 211,
      "name": "Spa"
    }, {
      "parent": 15,
      "id": 212,
      "name": "Veterinaria"
    }]},
  {
    "id": 16,
    "name": "Seguro y Reaseguro",
    "subcat": [{
      "parent": 16,
      "id": 213,
      "name": "Actuaría"
    }, {
      "parent": 16,
      "id": 214,
      "name": "Auditoría Interna"
    }, {
      "parent": 16,
      "id": 215,
      "name": "Compliance"
    }, {
      "parent": 16,
      "id": 216,
      "name": "Contabilidad de Reaseguro"
    }, {
      "parent": 16,
      "id": 217,
      "name": "Contratos / Reaseguro"
    }, {
      "parent": 16,
      "id": 218,
      "name": "Corredor de Seguros y Reaseguros"
    }, {
      "parent": 16,
      "id": 219,
      "name": "Dirección"
    }, {
      "parent": 16,
      "id": 220,
      "name": "Dirección General"
    }, {
      "parent": 16,
      "id": 221,
      "name": "Emisión Seguros"
    }, {
      "parent": 16,
      "id": 222,
      "name": "Facultativo / Reaseguro"
    }, {
      "parent": 16,
      "id": 223,
      "name": "Fiscal"
    }, {
      "parent": 16,
      "id": 224,
      "name": "Legal"
    }, {
      "parent": 16,
      "id": 225,
      "name": "Reaseguro / Contratación de"
    }, {
      "parent": 16,
      "id": 226,
      "name": "Siniestros / Reaseguro"
    }, {
      "parent": 16,
      "id": 227,
      "name": "Siniestros / Seguros"
    }, {
      "parent": 16,
      "id": 228,
      "name": "Suscripción / Seguros"
    }, {
      "parent": 16,
      "id": 229,
      "name": "Técnico / Reaseguro"
    }, {
      "parent": 16,
      "id": 230,
      "name": "Técnico / Seguros"
    }, {
      "parent": 16,
      "id": 231,
      "name": "Ventas"
    }]},
  {
    "id": 17,
    "name": "Tecnologías de la Información / Sistemas",
    "subcat": [{
      "parent": 17,
      "id": 232,
      "name": "Administración de bases de datos"
    }, {
      "parent": 17,
      "id": 233,
      "name": "Administración de Proyectos de TI"
    }, {
      "parent": 17,
      "id": 234,
      "name": "Administrador de servidores"
    }, {
      "parent": 17,
      "id": 235,
      "name": "Capacitación en TI"
    }, {
      "parent": 17,
      "id": 236,
      "name": "Consultoría en TI"
    }, {
      "parent": 17,
      "id": 237,
      "name": "Control de Calidad "
    }, {
      "parent": 17,
      "id": 238,
      "name": "Desarrollador / Programador de Software"
    }, {
      "parent": 17,
      "id": 239,
      "name": "Desarrollador / Programador web"
    }, {
      "parent": 17,
      "id": 240,
      "name": "Dirección"
    }, {
      "parent": 17,
      "id": 241,
      "name": "E- Business"
    }, {
      "parent": 17,
      "id": 242,
      "name": "Gerencia y Administración de Sistemas"
    }, {
      "parent": 17,
      "id": 243,
      "name": "Informática General"
    }, {
      "parent": 17,
      "id": 244,
      "name": "Ingeniería y Diseño de Hardware"
    }, {
      "parent": 17,
      "id": 245,
      "name": "Mantenimiento y Operación de Redes"
    }, {
      "parent": 17,
      "id": 246,
      "name": "Procesamiento de datos"
    }, {
      "parent": 17,
      "id": 247,
      "name": "SAP R/2"
    }, {
      "parent": 17,
      "id": 248,
      "name": "SAP R/3"
    }, {
      "parent": 17,
      "id": 249,
      "name": "Seguridad de Redes"
    }, {
      "parent": 17,
      "id": 250,
      "name": "Sistemas Informáticos"
    }, {
      "parent": 17,
      "id": 251,
      "name": "Soporte Técnico"
    }, {
      "parent": 17,
      "id": 252,
      "name": "Telecomunicaciones y Sistemas Móviles"
    }, {
      "parent": 17,
      "id": 253,
      "name": "Webmaster y diseño de WEB"
    }]},
  {
    "id": 18,
    "name": "Turismo, Hospitalidad y Gastronomía",
    "subcat": [{
      "parent": 18,
      "id": 254,
      "name": "Agente Aeropuerto "
    }, {
      "parent": 18,
      "id": 255,
      "name": "Agente de Viajes"
    }, {
      "parent": 18,
      "id": 256,
      "name": "Alimentos y Bebidas - restaurante y bar"
    }, {
      "parent": 18,
      "id": 257,
      "name": "Alimentos y Bebidas a cuartos"
    }, {
      "parent": 18,
      "id": 258,
      "name": "Alimentos y Bebidas -banquetes"
    }, {
      "parent": 18,
      "id": 259,
      "name": "Ama de Llaves"
    }, {
      "parent": 18,
      "id": 260,
      "name": "Asesoría y Consultoría"
    }, {
      "parent": 18,
      "id": 261,
      "name": "Atención a Clientes"
    }, {
      "parent": 18,
      "id": 262,
      "name": "Auxiliar de aviación"
    }, {
      "parent": 18,
      "id": 263,
      "name": "Chef"
    }, {
      "parent": 18,
      "id": 264,
      "name": "Cocina - auxiliar"
    }, {
      "parent": 18,
      "id": 265,
      "name": "Concierge"
    }, {
      "parent": 18,
      "id": 266,
      "name": "Dirección"
    }, {
      "parent": 18,
      "id": 267,
      "name": "Dirección General"
    }, {
      "parent": 18,
      "id": 268,
      "name": "Eventos, Convenciones y Banquetes"
    }, {
      "parent": 18,
      "id": 269,
      "name": "Grupos"
    }, {
      "parent": 18,
      "id": 270,
      "name": "Guía Turístico"
    }, {
      "parent": 18,
      "id": 271,
      "name": "Hotelería"
    }, {
      "parent": 18,
      "id": 272,
      "name": "Lavandería"
    }, {
      "parent": 18,
      "id": 273,
      "name": "Piloto aviador"
    }, {
      "parent": 18,
      "id": 274,
      "name": "Pisos y limpieza"
    }, {
      "parent": 18,
      "id": 275,
      "name": "Recepción"
    }, {
      "parent": 18,
      "id": 276,
      "name": "Reservaciones"
    }, {
      "parent": 18,
      "id": 277,
      "name": "Servicios Aéreos"
    }, {
      "parent": 18,
      "id": 278,
      "name": "Spa"
    }, {
      "parent": 18,
      "id": 279,
      "name": "Turismo"
    }]},
  {
    "id": 19,
    "name": "Ventas ",
    "subcat": [{
      "parent": 19,
      "id": 280,
      "name": "Administración y Apoyo a Ventas"
    }, {
      "parent": 19,
      "id": 281,
      "name": "Atención a Clientes"
    }, {
      "parent": 19,
      "id": 282,
      "name": "Desarrollo de negocios"
    }, {
      "parent": 19,
      "id": 283,
      "name": "Dirección"
    }, {
      "parent": 19,
      "id": 284,
      "name": "Gerencia de Ventas"
    }, {
      "parent": 19,
      "id": 285,
      "name": "Gerente de Canales de Distribución"
    }, {
      "parent": 19,
      "id": 286,
      "name": "Gerente de Franquicias"
    }, {
      "parent": 19,
      "id": 287,
      "name": "Gerente de Tienda"
    }, {
      "parent": 19,
      "id": 288,
      "name": "Representante de ventas"
    }, {
      "parent": 19,
      "id": 289,
      "name": "Supervisor de Ventas"
    }, {
      "parent": 19,
      "id": 290,
      "name": "Ventas"
    }, {
      "parent": 19,
      "id": 291,
      "name": "Ventas Corporativas"
    }, {
      "parent": 19,
      "id": 292,
      "name": "Ventas de Campo"
    }, {
      "parent": 19,
      "id": 293,
      "name": "Ventas de Detalle"
    }, {
      "parent": 19,
      "id": 294,
      "name": "Ventas de Mayoreo"
    }, {
      "parent": 19,
      "id": 295,
      "name": "Ventas Departamentales"
    }, {
      "parent": 19,
      "id": 296,
      "name": "Ventas internacionales"
    }, {
      "parent": 19,
      "id": 297,
      "name": "Ventas por Teléfono"
    }, {
      "parent": 19,
      "id": 298,
      "name": "Ventas Técnicas"
    }]},
  {
    "id": 20,
    "name": "Veterinaria / Zoología",
    "subcat": [{
      "parent": 20,
      "id": 299,
      "name": "Asistente Médico"
    }, {
      "parent": 20,
      "id": 300,
      "name": "Doctor"
    }, {
      "parent": 20,
      "id": 301,
      "name": "Estilista Canino"
    }]}
  ];
  console.log("Tamaño:" + x.length );
  async.map(x, function(item, ca){
    console.log(item);

    var s = new Sector({
      name: item.name
    });

    s.save(function(err, sectorData){
      async.map(item.subcat, function(i, call){
        var n = i.name;

        var j = new Job({
          name: n,
          type: 1,
          parent: sectorData._id
        });

        j.save(function(err, jobData){
          call(null, jobData);
        });

      }, function(e, r){
        ca(null, {sector: sectorData, job: r});
      });
    });
  }, function(err, results){

    res.render('jobs', { jobarea: results });
  });
  
});
router.post('/sendEmail',multipartMiddleware,  function(req, res){
  var asunto = req.body.asunto;
  var email  = req.body.email;
  var title  = req.body.title;
  var content = req.body.content;
  var file    = req.body.template;

  console.log( req.body );
  Generalfunc.sendEmail(file, {
    title: title,
    content: content
  }, email, asunto, function(status, html){
    if(html == undefined){
      res.send( { status: status, data: req.body });
    }else{
      res.send( html );  
    }
  });
});
module.exports = router;

