var gpsrouter = require('../routes/gps');

var Generalfunc  = require('../functions/generalfunc');
var Networkfunc  = require('../functions/networkfunc');
var Tokenfunc    = require('../functions/tokenfunc');
var Pushfunc     = require('../functions/pushfunc');
var APNfunc      = require('../functions/apnfunc');
module.exports = function(io){
  var gps = io.of('/gps');
var clientGPS = [];

/**
 * Iniciamos nuestro Namespace GPS, este solo es llamado cuando el App esta en la sección Agregar por Localización.
 */
gps.on('connection', function(socket){
/**
 * Emitimos un mensaje al App.
 */
  clientGPS.push(socket);
  socket.on('connect', function () {  });
  socket.on('connecting', function(data){

  });
/**
 * Esperamos a que la Sección "Agregar por Localización" se desconecte, para quitarla del Arreglo.
 */
  socket.on('disconnect', function () {
    gpsrouter.delete(socket.id.toString(), function(err, s){
      clientGPS.forEach(function(item, index){
        if(item == socket){
          delete clientGPS[index];
        }
      });
    });
  });
/**
 * SetLocation.- Este Evento recibe las coordenadas de el dispositivo, esto solo mientras esta en la seccion.
 * Revisamos que los datos sean definidos.
 * 
 */
  socket.on('setlocation', function(data){
    if(data == undefined || data == null){
      socket.emit('getlocation',{ message: "GET DATA UNDEFINED OR NULL"});
    }else{
      if(data.guid == undefined || data.guid == null){
        socket.emit('getlocation',{ message: "GUID UNDEFINED OR NULL"});
      }else{
        /**
         * Enviamos los datos a las rutas de GPS, para insertarla en la Coleccion y despues, buscamos en la tabla los elementos certa de el usuario. 500 metros.
         */
        gpsrouter.set(data.guid, data.gps,socket.id,  function(status, locationData){
          if(!status){
            var clientsGPSWY = clientGPS.filter(function(element){
              return element == socket;
            });

            clientsGPSWY.forEach(function(item, index){
              gpsrouter.find(item.id, function(err, locationData){
                item.emit('getlocation', { data: locationData, type: "other" });
              });
            });
          }
        });
      }
    }
  });
  /**
   * Definimos otro evento para la recepción de la Invitación. Enviamos los datos, al otro dispositivo.
   * Definimos Mensajes a enviar al Dispositivo en caso de que no Tenga Token, Perfil o Usuario.
   */
  socket.on('send_invitation', function(data){
    var guid      = data.guid;
    var public_id = data.public_id;


    gpsrouter.invite(guid, public_id, function(data, gpsData){
      var s = gpsData.socket;
      socket.to( s ).emit('gps_invite',data);

    }, function(data){
      socket.emit('gps_invited',data);
    },{
      no_token: function(){
        socket.emit('gps_invited',{ error: "Token Invalido"});
      },
      no_perfil: function(){
        socket.emit('gps_invited',{ error: "Perfil Invalido"});
      },
      no_usuario: function(){
        socket.emit('gps_invited',{ error: "Usuario no encontrado."});
      }
    });
  });
  /**
   * Cuando Se acepta, este evento se dispara, para crear la conexion, aceptar la amistad, y enviarle un mensaje a la otra persona de La 
   * Solicitud Aceptada. 
   */
  socket.on('accept_invite', function(data){
    gpsrouter.connect(data.profile, data.friend, true, function(data, locationData){
      var name = data.friend.first_name + " " + data.friend.last_name;

      var s = locationData.socket;
      socket.to( s ).emit('gps_result',{
        message: "Tu amigo " + name + " ha aceptado la invitación."
      });
    }, io);
  });
  /**
   * Si es rechazada, este evento se dispara, para generar la conexion, y acomodar el Estado como Rechazado. y se le notifica a la persona
   * Que rechazo la Solicitud.
   */
  socket.on('cancel_invite', function(data){
    gpsrouter.connect(data.profile, data.friend, false, function(data, locationData){
      var name = data.friend.first_name + " " + data.friend.last_name;

      var s = locationData.socket;
      socket.to( s ).emit('gps_result',{
        message: "Tu amigo " + name + " ha cancelado la invitación."
      });

    }, io);
  });
});  
};
