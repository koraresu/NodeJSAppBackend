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
router.post('/', function(req, res){
	res.send("Get Out of Here!!");
});
router.get('/', function(req, res){
	res.send("Get Out of Here!!");
});
router.get('/:master/:son', function(req, res){
	res.send("Get Out of Here!!");
});
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

			res.json( obj.getDensity() );
		});
	}, function(){
		res.send("No Permission");
	});
});
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
					search_date(convData, label, new_conversations, function(convN){
						callback( null, convN);
					});
				});
			},
			function(callback){
				model.network.find(d).exec(function(err, networkData){
					search_date(networkData, label, networks, function(netN){
						callback( null, netN);
					});
				});
			},
			function(callback){
				model.review.find(d).exec(function(err, reviewData){
					search_date(reviewData, label, reviews, function(revN){
						callback( null, revN);
					});
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
					search_date(newsData, label, news, function(newsN){
						callback( null, newsN);
					});
				});
			},
			function(callback){
				var gd = extend({
					"data.gallery": {
						"$exists": true
					}
				}, d);
				model.history.find(gd).exec(function(err, newsData){
					search_date(newsData, label, news_images, function(galleryN){
						callback( null, galleryN);
					});
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
		});
	}, function(){
		res.send("No Permission");
	});
});
router.post('/demografic/distribution', multipartMiddleware, function(req, res){

});
router.post('/catalogue', multipartMiddleware, function(req, res){
	var token     = req.body.token;
	if(token == BasicToken){
		var prop = [];
		model.profile
		.find({})
		.populate('user_id')
		.populate('experiences')
		.populate('speciality.id')
		.populate('job.id')
		.populate('location.city')
		.exec(function(err, profile){
			async.map(profile, function(item, callback){
				var d = {};
				if( item.experiences.length > 0){
					item.experiences.forEach(function(i){
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
						var empresa = "";
						if(i.company != undefined){
							if(i.company.name != undefined){
								empresa = i.company.name;
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
						d = {
							name: name,
							profesion: profesion,
							especialidad: speciality,
							empresa: empresa,
							ciudad: ciudad,
							estado: estado,
							email: email
							telefono: tel
						};
						prop.push( d );
					});
				}else{
					d = {
							name: item.first_name + " " + item.last_name,
							profesion: ,
							especialidad: ,
							empresa: ,
							ciudad: ,
							estado: ,
							email: ,
							telefono: ,
						};
						prop.push( d );
				}
			}, function(err, results){
				res.json( profile );
			});
			
		});
	}else{
		res.send("No Permission");
	}
});
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
		});
	});
});
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
		});
	});
});
module.exports = router;
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