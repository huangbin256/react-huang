var utils = require('../utils.js');
var daos = require('../dao/daos.js');


var routes = []; 

// This export One Extension that can have multiple routes 
// that will be loaded by App in main.js
module.exports = routes;


// --------- Generic Dao API --------- //
routes.push({
	method: 'GET',
	path:'/api/list-{type}', 
	handler: {
		async: function* (request, reply) {
			var dao = assertAndGetDao(request, reply);

			var list = yield dao.list();
			reply({success: true, list: list});
		}
	}
});

routes.push({
	method: 'POST',
	path:'/api/create-{type}', 
	handler: {
		async: function* (request, reply) {
			console.log("create-{type}", request.payload);
			var entity = JSON.parse(request.payload.entity);			
			var dao = assertAndGetDao(request, reply);
			var entityId = yield dao.create(entity);
			
			reply({success: true, id: entityId});
		}
	}
});

routes.push({
	method: 'POST',
	path:'/api/update-{type}', 
	handler: {
		async: function* (request, reply) {
			var dao = assertAndGetDao(request, reply);
			console.log("update-{type}", request.payload);
			var entity = JSON.parse(request.payload.entity);			
			var updateCount = yield dao.update(entity);
			
			reply({success: true, count: updateCount});
		}
	}
});
// --------- /Generic Dao API --------- //





function assertAndGetDao(request, reply){
	var dao = daos[request.params.type];

	if (utils.isNull(dao)){
		var error = {success: false, error: "WRONG-PARAM", errorMessage: `Param api/list-{type} [${request.params.type}] does not exist`};
		reply(error);
		throw new Error(error);
	}	

	return dao;
}