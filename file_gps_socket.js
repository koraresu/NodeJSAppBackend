var public_id = data;
Profilefunc.PublicId(data, function(publicStatus, profileFriendData){
  if(publicStatus){
    Gps.findOne({ socket: socket.id}).exec(function(errMeGps, gpsMeData){
      Profile.findOne({ _id: gpsMeData.profile }).exec(function(errMeProfile, profileMeData){
        Gps.findOne({ profile: profileFriendData._id }).exec(function(errFriendGps, gpsFriendData){

          Network.findOne({
            "profiles": {
              "$all":[
                profileMeData._id,
                profileFriendData._id
              ]
            }
          }).exec(function(errNetwork, networkData){
            if(!errNetwork && networkData){
              socket.broadcast.to(gpsFriendData.socket).emit('send_invitation', {
                  network: networkData,
                  send: profileMeData,
                  receive: profileFriendData
                });
            }else{

              var network = new Network({
                accepted: false,
                profiles: [
                  profileMeData._id,
                  profileFriendData._id
                ]
              });

              network.save(function(errNetwork, networkData){

                socket.broadcast.to(gpsFriendData.socket).emit('send_invitation', {
                  network: networkData,
                  send: profileMeData,
                  receive: profileFriendData
                });
              });
            }
          });
          


        });
      });
    });

  }else{

  }
});