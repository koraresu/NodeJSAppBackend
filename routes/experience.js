/**
 * Las peticiones de experiencias.
 *
 * @module Rutas.
 */
 var express = require('express');
var router = express.Router();

var mongoose    = require('mongoose');

var async = require('async');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var model        = require('../model');
var Profile      = model.profile;
var User         = model.user;
var Token        = model.token;
var Job          = model.job;
var Company      = model.company;
var CompanyClaim = model.company_claim;
var CompanyCreator = model.comp_creator;
var Experience   = model.experience;
var Network      = model.network;
var History      = model.history;
var Feedback     = model.feedback;
var Review       = model.review;
var Log          = model.log;
var Skill        = model.skill;
var Speciality   = model.speciality;
var Sector       = model.sector;
var Notification = model.notification;
var Feedback     = model.feedback;
var Conversation = model.conversation;
var Message      = model.message;
var City         = model.city;
var State        = model.state;
var Country      = model.country;

var Generalfunc = require('../functions/generalfunc');
var Profilefunc = require('../functions/profilefunc');
var Experiencefunc = require('../functions/experiencefunc');
var Networkfunc    = require('../functions/networkfunc');
var Tokenfunc = require('../functions/tokenfunc');
var Skillfunc = require('../functions/skillfunc');
var Historyfunc = require('../functions/historyfunc');
var format = require('../functions/format');

/**
 * Route "/state", Lista de estados. no entra ningun parametro.
 * @return {Object} Lista de estados.
 *
 */
router.post('/state', multipartMiddleware, function(req, res){
	City.find().distinct('state', function(error, states){
		Generalfunc.response(200, states, function(response){
			res.json( response );
		});
	});
});
/**
 * Route "/city", Lista de Ciudades dentro de un Estado.
 * @param {String} state, Nombre del Estado a buscar.
 * @return {Object} Lista de Ciudades.
 *
 */
router.post('/city', multipartMiddleware, function(req, res){
	var state = req.body.state;

	City.find({
		state: state
	}).select('_id name').exec(function(error, states){
		// Ordena los nombres con Acentos. Error 1.
		var nstates = states.sort( function(a,b){
			var x = a.name;
			return x.localeCompare(b.name);
		});
		Generalfunc.response(200, nstates, function(response){
			res.json( response );
		});

	});
});
/**
 * Route "/company/insert", Crear una empresa.
 * @param {String} guid, Token.
 * @param {String} name.
 * @param {String} telefono.
 * @param {String} web.
 * @param {String} description.
 * @param {String} calle.
 * @param {String} colonia.
 * @param {String} ciudad. Se envia en String pero por ObjectId.
 * @param {String} estado.
 * @param {String} numero.
 * @param {String} postal.
 * @return {Object} Lista de Ciudades.
 *
 */
router.post('/company/insert', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;

	var name      = req.body.nombre;
	var telefono  = req.body.telefono;
	var web       = req.body.web;
	var description = req.body.descripcion;

	var calle   = req.body.calle;
	var colonia = req.body.colonia;
	var ciudad  = req.body.ciudad;
	var estado  = req.body.estado;
	var numero  = req.body.number;
	var postal  = req.body.cp;

	if(name == undefined){
		name = "";
	}

	name = Generalfunc.capitalize( name );

	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){

					Company.findOne({ name: name }).exec(function(errCompany, companyData){
						if(!errCompany && companyData){

							companyData.name =  name;
							companyData.description = description;
							companyData.website = web;
							
							companyData.address.calle   = calle;
							companyData.address.colonia = colonia;
							companyData.address.ciudad = ciudad;
							companyData.address.estado = estado;
							companyData.address.numero = numero;
							companyData.address.postalc = postal;

							companyData.save(function(err, comp){
								Company.findOne({ _id: comp._id }).exec(function(eCompany, cData){
									Generalfunc.response(200, cData, function(response){
										res.json( response );
									});
								});
							});
						}else{
							var company = new Company({
								name: name,
								description: description,
								website: web,
								address: {
									calle: calle,
									colonia: colonia,
									ciudad: ciudad,
									estado: estado,
									numero: numero,
									postalc: postal
								},
								creator: profileData._id
							});
							company.save(function(errC, cData){
								/*
								var creator = new CompanyCreator({
									company: cData._id,
									profile: profileData._id
								});
								*/
								//creator.save(function(err, companyCreatorData){
									Generalfunc.response(200, cData, function(response){
										res.json( response );
									});
								//});
							});
						}
					});
					
				}else{
					Generalfunc.response(200, {}, function(response){
						res.json( response );
					});
				}
			});
		}else{
			Generalfunc.response(200, {}, function(response){
				res.json( response );
			});
		}
	});
});
/**
 * Route "/job/get", Obtener la lista de Puestos/Ocupaciones.
 * @param {String} guid, Token.
 * @param {String} name, Texto a buscar.
 * @return {Object} JSON.
 *
 */
router.post('/job/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;

	Tokenfunc.exist(guid, function(status, token){
		if(status){
			Experiencefunc.experienceJobGet(name, function(err, jobData){
				Generalfunc.response(200,jobData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/speciality/get", Obtener la lista de especialidades.
 * @param {String} guid, Token.
 * @param {String} name, Texto a buscar.
 * @return {Object} JSON.
 *
 */
router.post('/speciality/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			Experiencefunc.experienceSpecialityGet(name, function(err, specialityData){
				
				Generalfunc.response(200,specialityData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/sector/get", Obtener la lista de Sectores.
 * @param {String} guid, Token.
 * @param {String} name, Texto a buscar.
 * @return {Object} JSON.
 *
 */
router.post('/sector/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			Experiencefunc.sectorGet(name, function(err, jobData){
				
				Generalfunc.response(200,jobData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/company/get", Obtener la lista de Empresa.
 * @param {String} guid, Token.
 * @param {String} name, Texto a buscar.
 * @return {Object} JSON.
 *
 */
router.post('/company/get', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var name      = req.body.name;
	Tokenfunc.exist(guid, function(status, token){
		if(status){
			Experiencefunc.companyGet(name, function(err, companyData){
				
				Generalfunc.response(200,companyData, function(response){
					res.json(response);
				})
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/company/claim", Petición para avisar que cierto usuario mostro el contenido.
 * @param {String} guid, Token.
 * @param {String} id, Id de la empresa.
 * @return {Object} JSON.
 *
 */
router.post('/company/claim', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.id;

	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId(id);
	}
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					Profilefunc.formatoProfile(profileData._id,function( profile ){
						var claim = new CompanyClaim({
							profile: profileData._id,
							company: id
						});
						
						claim.save(function(err, c_claim){
							CompanyClaim.find({ _id: c_claim._id }).populate('profile').populate('company').exec(function(errComp, compData){
								Generalfunc.response(200, compData, function(response){
									res.json(response);
								})
							});
							
						});
					});
				}else{
					Generalfunc.response(101, {}, function(response){
							res.json(response);
						})
				}
			});
		}else{
			Generalfunc.response(101, {}, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/company/update", Petición para actualizar la Empresa.
 * @param {String} guid, Token.
 * @param {String} id, Id de Empresa.
 * @param {String} description, Descripción de la empresa.
 * @param {String} calle.
 * @param {String} numero.
 * @param {String} colonia.
 * @param {String} cp.
 * @param {String} estado.
 * @param {String} ciudad.
 * @param {String} tel.
 * @param {String} web.
 * @param {String} name, El nuevo nombre.
 * @return {Object} JSON.
 *
 */
router.post('/company/update', multipartMiddleware, function(req, res){ // Update Description
	var guid        = req.body.guid;
	var id          = req.body.id;
	var description = req.body.description;


	var calle       = req.body.calle;
	var numero      = req.body.numero;
	var colonia     = req.body.colonia;
	var cp          = req.body.cp;
	var estado      = req.body.estado;
	var ciudad      = req.body.ciudad;
	var tel         = req.body.tel;
	var web         = req.body.web;
	var name        = req.body.name;

	if(name == undefined){
		name = "";
	}
	if(ciudad == ""){

	}
	
	Tokenfunc.exist(guid, function(status, tokenData){
		if(status){
			Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
				if(status){
					if(mongoose.Types.ObjectId.isValid(id)){
						id = mongoose.Types.ObjectId(id);
						Company.findOne({ _id: id }).exec(function(err, companyData){
							var permiso = true;
							
							if(companyData.profile_id != undefined){
								if(companyData.profile_id.toString() != profileData._id.toString()){
									permiso = false;
								}
							}

							if(permiso){
								if(description.length <= 200){
									companyData.description = description;

									if(name != undefined){
										companyData.name    = name;
									}
									if(web != undefined){
										companyData.website = web;	
									}
									if(tel != undefined){
										companyData.phone   = tel;	
									}
									if(calle != undefined){
										companyData.address.calle   = calle;
									}
									if(colonia != undefined){
										companyData.address.colonia = colonia;
									}
									if(ciudad != undefined){
										companyData.address.ciudad  = ciudad;
									}else{
										companyData.address.ciudad  = null;
									}
									if(estado != undefined){
										companyData.address.estado  = estado;
									}
									if(numero != undefined){
										companyData.address.numero  = numero;
									}
									if(cp != undefined){
										companyData.address.postalc = cp;
									}
									console.log( companyData);
									companyData.save(function(err, comp){
										Company.findOne({
											_id: companyData._id
										}).exec(function(err, companyData){
											console.log( companyData );
											Experience.update({
												"company.id": companyData._id
											}, {
												$set: {
													"company.name": companyData.name
												}
											},{
												multi: true
											},function(err, experienceData){
												
												
												Experience.find({
													"company.id": companyData._id
												}).exec(function(err, experienceData){
													
													
													Generalfunc.response(200, companyData, function(response){
														res.json(response);
													});
												});
											});
										});
										
										
										/*
										Generalfunc.response(200, companyData, function(response){
											res.json(response);
										});
										*/

									});
								}else{
									Generalfunc.response(101, { message: "La descripcion es mayor." }, function(response){
										res.json(response);
									});
								}	
							}else{
								Generalfunc.response(101, { message: "Este perfil no tiene permisos." }, function(response){
									res.json(response);
								});
							}
							
						});
					}else{
						Generalfunc.response(101, { message: "id is not valid." }, function(response){
							res.json(response);
						});	
					}
				}else{
					Generalfunc.response(101, { message: "token dont have profile."}, function(response){
						res.json(response);
					});
				}
			});
		}else{
			Generalfunc.response(101, { message: "token doesn't exists." }, function(response){
				res.json(response);
			});
		}
	});
});
/**
 * Route "/company/getid", Petición obtener los datos de la empresa.
 * @param {String} guid, Token.
 * @param {String} id, Id de Empresa.
 * @return {Object} JSON.
 *
 */
router.post('/company/getid', multipartMiddleware, function(req, res){
	var guid      = req.body.guid;
	var id        = req.body.id;
	if(mongoose.Types.ObjectId.isValid(id)){
		id = mongoose.Types.ObjectId(id);
		Tokenfunc.exist(guid, function(status, tokenData){
			if(status){
				//Company.findOne({ _id: id }).exec(function(err, companyData){
				Tokenfunc.toProfile(tokenData.generated_id, function(status, userData, profileData, profileInfoData){
					Company.findOne({ _id: id }).populate('address.ciudad').exec(function(err, companyData){
						CompanyCreator.findOne({
							company: companyData._id			
						}).exec(function(errCompCreator, compCreatorData){
							Experience.find({ "company.id": id }).populate('profile_id').exec(function(err, experienceData){
								async.map(experienceData, function(item, ca){
									if( item.profile_id == null){
										ca(null, null);
									}else{
										ca(null, item);
									}
								}, function(err, results){
									results = Generalfunc.cleanArray(results);
									//companyData.name = Generalfunc.capitalize( companyData.name );
									var edit_permision = false;
									var company_profile = "";
									var company_creator = "";
									var profile_string  = "";

									profile_string = profileData._id.toString();


									company_profile = (companyData.profile_id != undefined)?companyData.profile_id.toString():"";

									if(!errCompCreator && compCreatorData){
										company_creator = (compCreatorData.profile != undefined)?compCreatorData.profile.toString():"";
									}

									if(company_profile != ""){
										if( profile_string == company_profile ){
											edit_permision = true;
										}
									}else{
										if( company_creator != ""){
											if( company_creator == profile_string ){
												edit_permision = true;
											}
										}
									}
									
									var data = {
										company: companyData,
										edit: edit_permision,
										/*
										edit: {
											allow:   edit_permision,
											claim:   company_profile,
											creator: company_creator,
											profile: profile_string
										},
										*/
										trabajo: results
									};


									Generalfunc.response(200,data, function(response){
										res.json(response);
									});
								});
							});
						});
					});
				});
			}else{
				Generalfunc.response(101, {}, function(response){
					res.json(response);
				});
			}
		});
	}else{
		Generalfunc.response(101, {}, function(response){
			res.json(response);
		});
	}
});

module.exports = router;
