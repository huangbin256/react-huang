'use strict';
var pg = require('pg');
var run = require('async6').run;



const defaultCfg = {
	host: "127.0.0.1",
	port: 5432	
};

const types = new Map();
types.set(String, ["varchar","text"]);
types.set(Number, ["int8","int16"]);
types.set(Boolean, ["bool"]);

// set the bigint as js int
var pgTypes = pg.types;
pgTypes.setTypeParser(20, function(val) {
	return parseInt(val);
});


class Db{
	constructor(){
		var jsTypeByDbType = new Map();
		for (var jsType in types){
			for (var dbType in types[jsType]){
				jsTypeByDbType.set(dbType,jsType);
			}
		}
		this.jsTypeByDbType = jsTypeByDbType;
	}

	init(cfg){
		var self = this;

		this.cfg = cfg = Object.assign({},defaultCfg, cfg);
		this.conString = `postgres://${cfg.user}`;
		if (cfg.pwd){
			this.conString += `:${cfg.pwd}`;
		}
		this.conString += `@${cfg.host}/${cfg.db}`;

		return this.connectTest().then(v => self.loadSchemaInfo());

	}

	loadSchemaInfo(){
		var self = this;

		return run(function*(){
			// select all tabname, columnname, columntypeid, columntypename for this schema
			var selectTables = `SELECT c.relname,a.attname, a.atttypid, t.typname 
																	FROM pg_class c, pg_attribute a, pg_type t 
																	WHERE a.attnum > 0 AND a.attrelid = c.oid AND a.atttypid = t.oid AND c.relname !~ '^(pg_|sql_)' AND c.relkind = 'r'`;
			
			var metadata = yield self.query(selectTables);
			// .rows[{relname, attname, atttypid, typname},....] 
			
			var tables = {};
			metadata.rows.forEach(r => {
				var table = tables[r.relname];
				if (!table){
					tables[r.relname] = table = {name: r.relname, columns:{}};
				}
				table.columns[r.attname] = {
					name: r.attname,
					typeid: r.atttypid,
					typename: r.typname,
					jstype: self.jsTypeByDbType.get(r.typename)
				};
			});
			self.tables = tables;
			//console.log('table schema loaded\n', tables);
		});

	}

	getTableInfo(name){
		return this.tables[name];
	}

	connectTest(){
		return this.query('SELECT $1::int AS number',['1']).then(r => console.log("db connect test:", r.rows[0].number));
	}

	query(sql, values){
		var self = this;
		values = values || [];

		return new Promise(function(resolve, reject){
			pg.connect(self.conString, function(err, client, done){
				if (err){
					reject(err);
				}
				client.query(sql,values, function(err, result){
					done(); // release client back to the pool

					if (err){
						reject(err);
					}else{
						resolve(result);	
					}					
				});
			});
		});
	}
}


module.exports = new Db();