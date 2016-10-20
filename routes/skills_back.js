Skill.findOne({ name: name}, function(err, skillData){
		if(!err && skillData){
			Profile.findOne({ _id: profile_id }, function(errProfile, profileData){
				if(!errProfile && profileData){
					var data = {
						name: skillData.name,
						id: skillData._id
					};
					var insertar = true;
					console.log(profileData);
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
									console.log(profileData);
									profileData.skills.push(data);
								}
								profileData.save(function(err, profileData){
									callback(true, skill, profileData);
								});
							}
						});	
					}
					
				}else{
					console.log("no Profile");
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
					console.log(profileData.skills);
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