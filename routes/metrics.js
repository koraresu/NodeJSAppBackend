/**
 * Las rutas de las Peticiones hechas desde el panel de Metricas en el Back.
 * La mayoria reciben un date_ini, date_end y token.
 * El token, esta definido como string en el codigo.
 * Date_ini.- Son valores datos enviados para definir donde iniciara la obtención de información.
 * Date_end.- Son valores datos enviados para definir donde finalizara la obtención de información.
 *
 * @module Rutas
 */
var express = require('express');
var router = express.Router();
var extend = require('util')._extend;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mongoose    = require('mongoose');
var moment = require('moment-timezone');
moment.locale('es');
var density = require('../density');
var async = require('async');
var randomColor = require('randomcolor');

var model = require('../model');
var Generalfunc = require('../functions/generalfunc');
var BasicToken = "atGMy5maUEMWPx67ubaPNGyJBWGeWw91XPBMwnCLmNfBk4A9lybdzs4N7bAs";
/**
 * Route "/", Es un comodin.
 * @return {String} "Get Out of Here!!"
 *
 */
router.post('/', function(req, res){
	res.send("Get Out of Here!!");
});
/**
 * Route "/", Es un comodin.
 * @return {String} "Get Out of Here!!"
 *
 */
router.get('/', function(req, res){
	res.send("Get Out of Here!!");
});
/**
 * Route "/[master]/[son]", Cualquier peticion que hagan por get, a metricas, regresara el mismo mensaje comodin.
 * @return {String} "Get Out of Here!!"
 *
 */
router.get('/:master/:son', function(req, res){
	res.send("Get Out of Here!!");
});
/**
 * Route "/performance/hivers", Obtiene los Usuarios Activos.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/performance/hivers', multipartMiddleware, function(req, res){	
	metric_check(req, function(token, date_ini, date_end){
		var run = function(date_ini, date_end, su){

			group = date_group(date_ini, date_end);

			var label = group.dates;
			var data = [];
			if(token == BasicToken){
				model.profile.find({
					"createdAt": {
						"$gte": date_ini,
						"$lt": date_end
					}
				}).populate('user_id').exec(function(err, profile){
					var active   = {
						label: "Activos",
						data: extend({}, group.cant),
						color: randomColor({ luminosity: 'dark', hue: 'green' })
					};
					var inactive   = {
						label: "Inactivos",
						data: extend({}, group.cant),
						color: randomColor({ luminosity: 'random', hue: 'orange' })
					};
					var total    = {
						label: "Inscritos",
						data: extend({}, group.cant),
						color: randomColor({ luminosity: 'bright', hue: 'red' })
					};

					async.map(profile, function(item, callback){
						var de = moment(new Date(item.createdAt));
						var compare = de.format('MMM YYYY').toUpperCase();
						var month = group.dates.indexOf( compare );

						total.data[month] +=1;
						if(item.user_id.verified){
							active.data[month] +=1;
						}else{
							inactive.data[month] +=1;
						}
						callback(null, item);
					}, function(err, pRes){
						su({
							label: label,
							total: pRes.length,
							data: {
								verified: active,
								unverified: inactive,
								registered: total
							}
						});
					});
					
				});
			}else{
				res.send("No Permission");
			}
		};
		if((date_ini) && (date_end)){
			run(date_ini,date_end, function(result){
				res.json( result );
			});	
		}else{
			res.send("No Date ini");
		}
		
	}, function(){
		res.send("No Permission");
	});
});
/**
 * Route "/performance/feedback", Obtienes la densidad de palabras en el feedback.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/performance/feedback', multipartMiddleware, function(req, res){
	metric_check(req, function(token, date_ini, date_end){
		var d = {};
		if(date_ini){
			if( date_end === false){ date_end = new Date(); };

			var d = {
				"createdAt": {
					"$gte": date_ini,
					"$lt": date_end
				}
			};
		}else{
			if( date_end ){
				var d = {
					"createdAt": {
						"$lt": date_end
					}
				};
			}else{
				var d = {};
			}
		}
		model.feedback.find(d).distinct("content",function(err, a){
			if(!err && a){
				if(a.length > 0){
					var text = a.join(' ');
					text = text.replace(/[0-9]/g, "");
					text = text.replace(/\?/g,"");
					text = text.replace(/\!/g,"");
					text = text.replace(/\¿/g,"");
					text = text.replace(/\¡/g,"");
					text = text.replace(/\,/g,"");
					text = text.replace(/\(/g," ");
					text = text.replace(/\)/g," ");
					text = text.replace("  "," ");
					var obj = density(text);
					if(obj != null){
						res.json( obj.getDensity() );	
					}else{
						res.json({});
					}
					
				}else{
					res.json({});
				}
				
			}else{
				res.jsoN( {} );
			}
			
		});
	}, function(){
		res.send("No Permission");
	});
});
/**
 * Route "/performance/interactions", Obitnes las Iteracciones entre usuarios, Conexiones, Agregar a Colmena y Conversaciones.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/performance/interactions', multipartMiddleware, function(req, res){
	metric_check(req, function(token, date_ini, date_end){
		group = date_group(date_ini, date_end);
		
		var label = group.dates;

		var new_conversations = {
			label: "Conversaciones nuevas",
			data: extend({}, group.cant),
			color: randomColor({ luminosity: 'dark', hue: 'green' })
		};
		var reviews = {
			label: "Activos",
			data: extend({}, group.cant),
			color: randomColor({ luminosity: 'bright', hue: 'orange' })
		};
		var networks = {
			label: "Añadir a Colmena",
			data: extend({}, group.cant),
			color: randomColor({ luminosity: 'bright', hue: 'red' })
		};

		var d = {
			"createdAt": {
				"$gte": date_ini,
				"$lt": date_end
			}
		};
		async.series([
			function(callback){
				model.conversation.find(d).exec(function(err, convData){
					if(!err && convData){
						search_date(convData, label, new_conversations, function(convN){
							callback( null, convN);
						});	
					}else{
						callback(null, {});
					}					
				});
			},
			function(callback){
				model.network.find(d).exec(function(err, networkData){
					if(!err && networkData){
						search_date(networkData, label, networks, function(netN){
							callback( null, netN);
						});	
					}else{
						callback(null, {});
					}
				});
			},
			function(callback){
				model.review.find(d).exec(function(err, reviewData){
					if(!err && reviewData){
						search_date(reviewData, label, reviews, function(revN){
							callback( null, revN);
						});
					}else{
						callback(null, {});
					}
				});
			},
			], function(err, results){
				res.json({
					label: label,
					conversation: results[0],
					network: results[1],
					review: results[2]
				})
			});
	}, function(){
		res.send("No Permission");
	});
});
/**
 * Route "/performance/publications", Obitnes las Iteracciones entre usuarios, Noticias.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/performance/publications', multipartMiddleware, function(req, res){
	metric_check(req, function(token, date_ini, date_end){
		group = date_group(date_ini, date_end);
		
		var label = group.dates;

		var news = {
			label: "Noticias",
			data: extend({}, group.cant),
			color: randomColor({ luminosity: 'random', hue: 'orange' })
			
		};
		var news_images = {
			label: "Fotos",
			data: extend({}, group.cant),
			color: randomColor({ luminosity: 'dark', hue: 'green' })
		};
		var d = {
			"createdAt": {
				"$gte": date_ini,
				"$lt": date_end
			}
		};
		async.series([
			function(callback){
				var nd = extend({
					"data.gallery": {
						"$exists": false
					}
				}, d);
				model.history.find(nd).exec(function(err, newsData){
					if(!err && newsData){
						search_date(newsData, label, news, function(newsN){
							callback( null, newsN);
						});
					}else{
						callback(null, {});
					}
				});
			},
			function(callback){
				var gd = extend({
					"data.gallery": {
						"$exists": true
					}
				}, d);
				model.history.find(gd).exec(function(err, newsData){
					if(!err && newsData){
						search_date(newsData, label, news_images, function(galleryN){
							callback( null, galleryN);
						});
					}else{
						callback(null, {});
					}
				});
			},
			], function(err, results){
				res.json({
					label: label,
					news: results[0],
					gallery: results[1],
				})
			});
	}, function(){
		res.send("No Permission");
	});
});
/**
 * Route "/demografic/age", Obtiene la distrubución de usuarios por edades.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/demografic/age', multipartMiddleware, function(req, res){
	var label  = [];
	var value  = [];
	var colors = [];
	var percentaje = [];
	metric_check(req, function(token, date_ini, date_end){
		model.profile.find({
			"createdAt": {
				"$gte": date_ini,
				"$lt": date_end
			}
		}).exec(function(err, profile){
			if(!err && profile){
				async.map(profile, function(item, callback){
					if(item.birthday != undefined){
						if(item.birthday != null){
							var age = _calculateAge( item.birthday );
							if(age != null){
								var x = label.indexOf( age );
								if(x == -1){
									label.push(age);
									colors.push( randomColor({ luminosity: 'bright', hue: 'random' }) );
									value.push(1);
								}else{
									value[x] +=1;
								}
							}
							callback(null, null);
						}else{
							callback(null, null);
						}
					}else{
						callback(null, null);
					}
				}, function(err, results){
					async.map(value, function(item, cb){
						percentaje[percentaje.length] = ((item.val*100)/value.length);
						cb(null, item);
					}, function(err, results){
						res.json({ label: label, value: value, color: colors, percentaje: percentaje  });
					})
					
				});
			}else{
				res.json({ label: [], value: [], color: [], percentaje: []  });
			}
		});
	}, function(){
		res.send("No Permission");
	});
});
/**
 * Route "/demografic/distribution", Obtiene la distribucion de usuarios por distintos estados.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/demografic/distribution', multipartMiddleware, function(req, res){
	metric_check(req, function(token, date_ini, date_end){
		var prop = [];
		model.profile.find({
			"createdAt": {
				"$gte": date_ini,
				"$lt": date_end
			}
		}).populate('location.city').select('location').exec(function(errProfile, profileData){
			if(!errProfile && profileData){
				var t = profileData.length;
				async.map(profileData, function(item, callback){
					var state = "null";
					if(item.location != undefined){
						if(item.location.city != undefined){
							if(item.location.city.state != undefined){
								state = item.location.city.state.toString();
							}
						}
					}

					var x = prop.findIndex(function(item){
						return (state == item[0])
					});
					if(x == -1){
						prop.push([
							state,
							1,
							Math.floor((1*100)/t)
						]);
					}else{
						prop[ x ][ 1 ] += 1;
						prop[ x ][ 2 ] = Math.floor((prop[ x ][1]*100)/t);
					}

					callback( null, null);
				}, function(err, results){
					prop.unshift([
						"Estado",
						"Perfiles",
						"Porcentaje"
					]);
					res.json({
						data: prop,
						total: profileData.length
					});
				});
			}else{
				res.json({
					data: {},
					total: 0
				});
			}
		});
		
	});
});
/**
 * Route "/catalogue", Lista de puestos de usuarios, si tiene dos puestos se manejan dos registros en esta lista.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} { name, profesion, especialidad, empresa, ciudad, estado, email, telefono }
 *
 */
router.post('/catalogue', multipartMiddleware, function(req, res){
	var token     = req.body.token;
	var max       = req.body.max;
	var page      = req.body.page;
	var pages     = 1;
	/* FILTERS */
	var name         = req.body.name;
	var profesion    = req.body.profesion;
	var empresa      = req.body.empresa;
	var especialidad = req.body.especialidad;
	var ciudad       = req.body.ciudad;


	var pagination = Generalfunc.pagination(page, max);
	max = pagination.max;
	pages = pagination.pages;

	var func = function(d, success){
		var prop = [];
		model.profile
		.find(d)
		.populate('user_id')
		.populate('experiences')
		.populate('speciality.id')
		.populate('job.id')
		.populate('location.city')
		.skip(pages)
		.limit(max)
		.sort({
			first_name: 1,
			last_name: 1
		})
		.exec(function(err, profile){
			if(!err && profile){
				async.map(profile, function(item, callback){
					var d = {};

					var name = item.first_name + " " + item.last_name;
					var profesion = "";
					if(item.job != undefined){
						if(item.job.id != undefined){
							if(item.job.id.name != undefined){
								profesion = item.job.id.name;
							}
						}
					}
					var speciality = "";
					if(item.speciality != undefined){
						if(item.speciality.id != undefined){
							if(item.speciality.id.name != undefined){
								speciality = item.speciality.id.name;
							}
						}
					}
					var ciudad = "";
					var estado = "";

					if(item.location != undefined){
						if(item.location.city != undefined){
							if(item.location.city.name != undefined){
								ciudad = item.location.city.name;
							}
							if(item.location.city.state != undefined){
								estado = item.location.city.state;
							}
						}
					}
					var email = "";
					if(item.user_id != undefined){
						if(item.user_id.email != undefined){
							email = item.user_id.email;
						}
					}
					var tel = "";
					if( item.phone != undefined){
						tel = item.phone;
					}
					var empresa = "";

					if( item.experiences.length > 0){
						async.map(item.experiences, function(i,cb){
							if(i.company != undefined){
								if(i.company.name != undefined){
									empresa = i.company.name;
								}
							}
							//A
							d = {
								name: name,
								profesion: profesion,
								especialidad: speciality,
								empresa: empresa,
								ciudad: ciudad,
								estado: estado,
								email: email,
								telefono: tel
							};
							prop.push( d );
							cb( null, null);
						}, function(err, results){
							callback(null, null);
						});
					}else{
						d = {
							name: name,
							profesion: profesion,
							especialidad: speciality,
							empresa: empresa,
							ciudad: ciudad,
							estado: estado,
							email: email,
							telefono: tel
						};
						prop.push( d );

						callback(null, null);
					}
				}, function(err, results){
					success( prop );
				});
			}else{
				success([]);
			}
		});
	}
	if(token == BasicToken){
		var d         = {};

		if(name != undefined || name != ""){
			if(mongoose.Types.ObjectId.isValid( name )){
				d.name = mongoose.Types.ObjectId( name );
			}
		}
		if(empresa != undefined || empresa != ""){
			if(mongoose.Types.ObjectId.isValid( empresa )){
				d.empresa = mongoose.Types.ObjectId( empresa );
			}
		}
		if(ciudad != undefined || ciudad != ""){
			if(mongoose.Types.ObjectId.isValid( ciudad )){
				d.ciudad = mongoose.Types.ObjectId( ciudad );
			}
		}
		if(especialidad != undefined || especialidad != ""){
			if(mongoose.Types.ObjectId.isValid( especialidad )){
				d.especialidad = mongoose.Types.ObjectId( especialidad );
			}
		}
		if(profesion != undefined || profesion != ""){
			if(mongoose.Types.ObjectId.isValid( profesion )){
				d.profesion = mongoose.Types.ObjectId( profesion );
			}
		}

		model.experience.find({
			"company.id": d.empresa
		}).distinct('_id',function(errExp, expData){
			model.city.find({
				"_id": d.ciudad
			}).distinct("_id",function(errCity, cityData){
				model.speciality.find({
					"_id": d.especialidad
				}).distinct("_id",function(errSpeciality, specialityData){
					model.job.find({
						"_id": d.profesion
					}).distinct("_id",function(errJob, jobData){
						var da = {};
						if(d.profesion != undefined){
							da["job.id"] = { "$in": jobData };
						}
						if(d.especialidad != undefined){
							da["speciality.id"] = { "$in": specialityData };
						}
						if(d.empresa != undefined){
							da["experiences"] = { "$in": expData };
						}
						if(d.ciudad != undefined){
							da["location.city"] = { "$in": cityData };
						}
						if(d.name != undefined){
							da._id = d.name;
						}
						func(da, function(prop){
							res.json({
								data: da,
								profile: prop
							});
						});
					});
				});
			});
		});
	}else{
		res.send("No Permission");
	}
});
/**
 * Route "/profesional/profesions", Cantidad de Usuarios por Profesion.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/profesional/profesions', multipartMiddleware, function(req, res){
	var all        = [];

	var label      = [];
	var value      = [];
	var color      = [];
	var percentaje = [];
	metric_check(req, function(token, date_ini, date_end){
		model.experience.find({
			"createdAt": {
				"$gte": date_ini,
				"$lt": date_end
			}
		}).exec(function(err, experience){
			if(!err && experience){
				async.map(experience, function(item, callback){

					if(item.ocupation != undefined){
						if(item.ocupation.name != undefined){
							all = find_element(all, item.ocupation.name, {
								name: item.ocupation.name,
								color: randomColor({ luminosity: 'bright', hue: 'random' }),
								val: 1
							});
							callback(null, null);	
						}else{
							callback(null, null);
						}
					}else{
						callback(null, null);
					}
					
				}, function(err, results){
					all.sort(function(a,b){
						if(a.rate > b.rate){
							return 0;
						}else{
							return 1;
						}
					});
					all = Generalfunc.cleanArray(all);
					async.map(all, function(item, c){
						if(item != null){
							label[label.length] = item.name;
							value[value.length] = item.val;
							color[color.length] = item.color;
							percentaje[percentaje.length] = ((item.val*100)/all.length);
						}
						c(null, item);
					}, function(err, results){
						res.json({ label: label, value: value, color: color, percentaje: percentaje  });
					});
				});
			}else{
				res.json({ label: [], value: [], color: [], percentaje: [] });
			}
			
		});
	});
});
/**
 * Route "/profesional/review", Cantidad de Reseñas hechas.
 * @param {String} date_ini, Fecha de inicio para la obtención de los valores.
 * @param {String} date_end, Fecha final para limitar los valores.
 * @param {String} token, string dado de alta como variable.
 * @return {Object} Formato requerido por la libreria de Graficas.
 *
 */
router.post('/profesional/review', multipartMiddleware, function(req, res){
	var all    = [];

	var label  = [];
	var value  = [];
	var color = [];
	var percentaje = [];
	metric_check(req, function(token, date_ini, date_end){
		model.review.find({
			"createdAt": {
				"$gte": date_ini,
				"$lt": date_end
			}
		}).exec(function(err, review){
			if(!err && review){
				async.map(review, function(item, callback){
					if(all[item.rate] == undefined){
						all[item.rate] = {
							rate: item.rate,
							color: randomColor({ luminosity: 'bright', hue: 'random' }),
							val: 1
						};
					}else{
						all[item.rate].val+=1;
					}
					callback(null, null);
				}, function(err, results){
					all.sort(function(a,b){
						if(a.rate > b.rate){
							return 0;
						}else{
							return 1;
						}
					});
					all = Generalfunc.cleanArray(all);
					async.map(all, function(item, c){
						if(item != null){
							label[label.length] = item.rate;
							value[value.length] = item.val;
							color[color.length] = item.color;
							percentaje[percentaje.length] = ((item.val*100)/all.length);
						}
						c(null, item);
					}, function(err, results){
						res.json({ label: label, value: value, color: color  });
					});
				});
			}else{
				res.json({ label: [], value: [], color: []  });
			}
		});
	});
});
module.exports = router;
/**
 * get_date, Obtenemos un String, y lo transformamos en Objeto Date.
 * @param {String} date. 
 * @return {Date}
 *
 */
function get_date(date){
	if(date === undefined){
		return false;
	}else{
		var date = date.split('/');
		if(date.length == 3){
			var day = date[0];
			var month = ((date[1]*1)-1);
			var year = date[2];
			return new Date(year, month, day);
		}else{
			return false;
		}	
	}
};
/**
 * date_group, Agrupamos, y generamos los espacios donde vamos a poner los datos.
 * @param {Date} ini, Fecha de Inicio. 
 * @param {Date} end, Fecha de Fin.
 * @return {Object} {date: Array de Fechas, cant: Array de datos "0"}
 *
 */
function date_group(ini, end){
	var dates      = [];
	var empty      = [];
	var startYear  = ini.getFullYear();
	var endYear    = end.getFullYear();
	var startMon   = ini.getMonth()+1;
	var endMonth   = end.getMonth()+1;
	for(var i = startYear; i <= endYear; i++) {

		var endMonth = ( i != endYear ) ? 11 : end.getMonth();
		var startMon = ( i === startYear )? ini.getMonth() : 0;

		for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
			var month = j+1;
			var displayMonth = month < 10 ? '0'+month : month;
			var item = displayMonth+"/01"+"/"+i;
			var m = moment(Date.parse(item));
			/*
			var array = {
				string: item,
				show: (m.format('MMM YYYY')+"").toUpperCase(),
				full: m.tz("America/Mexico_City").format()
			};
			*/
			dates.push((m.format('MMM YYYY')+"").toUpperCase());
			empty.push( 0 );
		}
	}
	return { dates: dates, cant: empty};
};
/**
 * metric_check, sirve para revisar si los datos enviados estan correctos.
 * @param {String} req, obtienes date_ini, date_end y token.
 * @param {String} success,
 * @param {String} fail, 
 * @return {success|fail}
 *
 */
function metric_check(req, success, fail){
	var date_ini  = req.body.date_ini;
	var date_end  = req.body.date_end;
	var token     = req.body.token;

	date_ini = get_date(date_ini);
	date_end = get_date(date_end);

	if(token == BasicToken){
		if(date_ini){
			if( date_end === false){ date_end = new Date(); };

			success(token, date_ini, date_end);
		}else{
			success(token, date_ini, date_end);
		}
	}else{
		fail();
	}
}
function search_date(data, dates, block, success){
	var n = block;
	async.map(data, function(i, c){
		var de = moment(new Date(i.createdAt));
		var compare = de.format('MMM YYYY').toUpperCase();
		var month = dates.indexOf( compare );
		n.data[month] +=1;
		c(null, null);
	}, function(err, r){
		success( n );
	});
}
function _calculateAge(birthday) { // birthday is a date
	var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
function find_element(array, index,nuevo){
	var i = array.findIndex(function(element){
		return (index == element.name);
	});

	if(i == -1){
		array.push(nuevo);
	}else{
		array[i].val += 1;
	}
	return array;
}