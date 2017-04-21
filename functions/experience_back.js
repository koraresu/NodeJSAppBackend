router.post('/create', multipartMiddleware, function(req, res){
	var guid       = req.body.guid;
	var type       = req.body.type; // 0 = independiente | 1 = company
	var company    = req.body.company;
	var sector     = req.body.sector;
	var ocupation  = req.body.ocupation;
	Tokenfunc.exist(guid, function(errToken, token){
		if(errToken){
			Tokenfunc.toProfile(token.generated_id, function(status, userData, profileData, profileInfoData){
				if(type == 0){
					Experiencefunc.jobExistsOrCreate({
						name: job,
					},{
						name: job,
					},function(status, jobData){

						Experiencefunc.insertOrExists(profileData,type, data, function(statusExperience, experienceData){
							Generalfunc.response(200,experienceData,function(response){
								res.json(response);
							});
						});

					});
				}else{
					func.companyExistsOrCreate({
						name: company
					},{
						name: company
					},profileData, function(status, companyData){
						func.jobExistsOrCreate({
							name: ocupation,
							type: 0
						},{
							name: ocupation,
							type: 0
						}, function(status, ocupationData){
							Experiencefunc.jobExistsOrCreate({
								name: job,
								type: 1
							},{
								name: job,
								type: 1
							},function(status, jobData){


								Experiencefunc.sectorExistsOrCreate({
									name: sector
								},{
									name: sector
								}, function(status, sectorData){
									var data = {
										profile_id: profileData._id,
										type: type,
										ocupation: {
											id:   ocupationData._id,
											name: ocupationData.name
										},
										company: {
											id: companyData._id,
											name: companyData.name
										},
										sector: {
											id: sectorData._id,
											name: sectorData.name
										}
									};



									func.insertOrExists(data,data, function(statusExperience, experienceData){
										func.response(200,experienceData,function(response){
											res.json(response);
										});
									});
								});

							});
						});
					});
				}
			});
		}else{

		}
	});