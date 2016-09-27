import pxhr from './utils/pxhr.js';


var maos = {};

export function mao(entityName){
	return maos[entityName];
}

// --------- Dao Classes --------- //
class BaseMao{
	constructor(type, store){
		this.type = type;
		this.store = store;
		this.listeners = {};
		this.listenersSeq = 0;
	}

	get(id){
		// for now return the first item
		return this.store.data[id];
	}

	create(newEntity){
		var self = this;

		return pxhr.post(`/api/create-${this.type}`,{entity: JSON.stringify(newEntity)}).then(id => {
			console.log("mao.create DONE", id);

			// send the event, but after we resolve this.
			setTimeout(function(){
				self.notify({
					type: "create",
					entity: Object.assign({},newEntity)
				});				
			}, 0);

			return id;
		});
	}

	update(newEntity){
		var self = this;

		return pxhr.post(`/api/update-${this.type}`,{entity: JSON.stringify(newEntity)}).then(r => {
			setTimeout(function(){
				self.notify({
					type: "update",
					entity: Object.assign({},newEntity)
				});
			}, 0);
			return r;
		});

	}

	remove(id){
		var self = this;

		return pxhr.post(`/api/delete-${this.type}`,{key: id}).then(r => {
			setTimeout(function(){
				self.notify({
					type: "delete",
					entity: Object.assign({id: id})
				});
			}, 0);
			return r;
		});

	}

	list(conditions){
		return pxhr.get(`/api/list-${this.type}`).then(result => result.list);

		// console.log("list ", this);
		// return new Promise(function(resolve, reject){
		// 	// for now return the full list
		// 	var l = [];
		// 	for (var k in self.store.data){
		// 		l.push(self.store.data[k]);
		// 	}
		// 	resolve(l);
		// });
	}

	nextSeq(){
		var next = this.store.seq + 1;
		this.store.seq = next; 
		return next; 
	}

	notify(dataEvent){
		for (var fnId in this.listeners){
			this.listeners[fnId](dataEvent);
		}
	}

	listen(fn){
		var fnId = this.listenersSeq += 1;
		this.listeners[fnId] = fn;
		return fnId;
	}

	unlisten(fnId){
		delete this[fnId];
	}
}

// --------- /Mao Classes --------- //


// --------- Register Maos --------- //
maos["contact"] = new BaseMao("contact");
// --------- /Register Maos --------- //
