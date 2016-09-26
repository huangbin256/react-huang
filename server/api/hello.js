var utils = require('../utils.js');
var daos = require('../dao/daos.js');

var run = utils.run;

var count = 0;

var routes = []; 

// This export One Extension that can have multiple routes 
// that will be loaded by App in main.js
module.exports = routes;


routes.push({
	method: 'GET',
	path:'/api/simpleHello', 
	handler: function (request, reply) {
		reply({msg:"hello"});
	}	
});

// Hello api
routes.push({
	method: 'GET',
	path:'/api/hello', 
	handler: function (request, reply) {
		run(apiHello(request, reply));
	}
});


// Async hello
routes.push({
	method: 'GET',
	path:'/api/asyncHello', 
	handler: {
		async: function* (request, reply) {
			count++;

			var c = yield echo(1);

			var t = (yield daos.task.get(1)) || null;
			console.log("t",t);
			
			var r = yield Promise.all([asyncEcho(3), asyncEcho(3), asyncEcho(3)]);
			c += r[0] + r[1] + r[2];
			reply({name:'hello world', c: c, p: p, t: t});		
		}
	}
});



function* apiHello(request, reply){
	count++;

	var c = yield echo(1);
	
	c += yield asyncEcho(3);

	reply({name:'hello world', c: c});
}



function echo(v){
	return v;
}

function asyncEcho(v){
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			if (v > 100){
				reject(new Error("Value > 100, too big"));
			}else{
				resolve(v);
			}
		},0);
	});
}