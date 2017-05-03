Skill.findOne({ name: name}, function(err, skillData){
		if(!err && skillData){
			Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
				if(!errProfile && profileData){
					var data = {
						name: skillData.name,
						id: skillData._id
					};
					var insertar = true;
					
					if(profileData.skills.length == 0){
						if(insertar){
							profileData.skills.push(data);
						}
						profileData.save(function(err, profileData){
							callback(true, skill, profileData);
						});
					}else{
						profileData.skills.forEach(function(item, index){

							if(item.name == name){
								insertar = false;
							}
							if(index == (profileData.skills.length-1)){
								if(insertar){
									
									profileData.skills.push(data);
								}
								profileData.save(function(err, profileData){
									callback(true, skill, profileData);
								});
							}
						});	
					}
					
				}else{
					
					callback(false);
				}
			});
		}else{
			var skill = new Skill({
				name: name
			});
			skill.save(function(err, skillData){
				Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
					var data = {
						name: skillData.name,
						id: skillData._id
					};
					var insertar = true;
					
					profileData.skills.forEach(function(item, index){

						if(item.name == name){
							insertar = false;
						}
						if(index == (profileData.skills.length-1)){
							if(insertar){
								profileData.skills.push(data);
							}
							profileData.save(function(err, profileData){
								callback(true, skill, profileData);
							});
						}
					});
				});
			});
		}
	});