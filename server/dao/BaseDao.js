'use strict';
var utils = require("../utils.js");
var db = require("./db.js");

class BaseDao{

	constructor(daoInfo){
		this._daoInfo = daoInfo;
		this._info = null;
	}

	_getInfo(){
		if (this._info === null){
			this._info = Object.assign({}, db.getTableInfo(this._daoInfo.entity), this._daoInfo);
			this._keySet = new Set([this._info.key]);
		}
		return this._info;
	}


	get(key){
		var tableInfo = this._getInfo();
		var columnNames = quoteColumns(Object.keys(tableInfo.columns));

		var sql = `SELECT ${columnNames} from "${tableInfo.name}" where ${tableInfo.key} = $1`;
		return db.query(sql,[key]).then(r => (r.rows.length > 0)?pruneNulls(r.rows[0]):null);
	}

	// create an entity, and return id.
	create(entity){
		var tableInfo = this._getInfo();
		
		// TODO: throw error when entity has a key property. 

		var namesValues = pruneNamesValues(entity, tableInfo, this._keySet);
		var columnNames = quoteColumns(namesValues.names);
		var preparedVals = namesValues.values.map((v, i) => "$" + (i +1)).join(",");

		var sql = `INSERT INTO "${tableInfo.name}" (${columnNames}) values (${preparedVals}) returning "${tableInfo.key}"`;
		return db.query(sql,namesValues.values).then(r => r.rows[0][tableInfo.key]);
	}

	update(entity){
		var tableInfo = this._getInfo();

		var key = entity[tableInfo.key];
		if (utils.isNull(key)){
			throw new Error(`cannot update [${tableInfo.name}] entity because no key [${tableInfo.key}] in object ${entity}`);
		}

		// Note: when building namesValues, we ignore the keys of this entity (we do not want to set the key)
		var namesValues = pruneNamesValues(entity, tableInfo, this._keySet);
		var preparedSet = namesValues.names.map((n, i) => `"${n}" = $${(i + 1)}`).join(",");

		namesValues.values.push(key);

		var sql = `UPDATE "${tableInfo.name}" set ${preparedSet} WHERE "${tableInfo.key}" = $${namesValues.values.length}`;

		return db.query(sql,namesValues.values).then(r => r.rowCount);
	}
	
	// List this entity with
	// @param cond (optional): 
	//			Is an array of items represenation of AND and Or criteria. 
	//			Object Items may contains on or more rules that will be applied as AND. 
	//			Array Object Items will be combined as OR.
	//			For example: [{"subject;ilike":"test%", "closed": true}, {"closed": true}] 
	//										means task with subject starting with "test" and closed, or any open tickets
	list(conds, orderBys){
		var tableInfo = this._getInfo();

		var columnNames = quoteColumns(Object.keys(tableInfo.columns));

		var condsSqlAndValues = null;

		var sql = [`SELECT ${columnNames} from "${tableInfo.name}"`];
		if (!utils.isEmpty(conds)){
			condsSqlAndValues = buildSqlFromConds(conds);
		}

		var vals;
		if (condsSqlAndValues != null){
			sql.push(` WHERE ${condsSqlAndValues.sql}`);
			vals = condsSqlAndValues.values;
		}else{
			vals = [];
		}

		// TODO: make the order by dynamics
		sql.push(" order by id");

		sql = sql.join("");

		return db.query(sql,vals).then(r => (r.rows.length > 0)?r.rows.map(entity => pruneNulls(entity)):null);
	}	

	remove(key){
		var tableInfo = this._getInfo();
		
		var sql = `delete from "${tableInfo.name}" where ${tableInfo.key} = $1`;
		return db.query(sql,[key]).then(r => key);
	}
}

// --------- BaseDao Utilities --------- //

function buildSqlFromConds(conds){
	var sql = [];
	var vals = [];
	conds = (conds instanceof Array)?conds:[conds];
	var cond, name;	
	var i = 0; 
	for (cond of conds){
		if (i > 0){
			sql.push(" OR ");
		}
		let j = 0;
		for (name in cond){
			let val = cond[name];
			if (j > 0){
				sql.push(" AND ");
			}
			let nameAndOp = name.split(";");
			name = nameAndOp[0];
			let op = (nameAndOp.length > 1)?nameAndOp[1]:"=";
			vals.push(val);
			sql.push(` "${name}" ${op} $${vals.length} `);
			j++;
		}

		i++;
	}
	return {
		sql: sql.join(""),
		values: vals
	};
}

// return a new array where each item are surround by "
// columns can be and object or array
function quoteColumns(columns){
	return columns.map(v => `"${v}"`).join(",");
}

// return a new entity object without the null/undefined
function pruneNulls(entity){
	var v; 
	var newEntity = {};
	for (var k in entity){
		v = entity[k];
		if (!utils.isNull(v)){
			newEntity[k] = v;
		}
	}
	return newEntity;
}
// prune an entity name/value from a table info and return {names: [], values: []}
// ignoreSet (optional) is a set of keyName that should be ignored when building the arrays.
function pruneNamesValues(entity, tableInfo, ignoreSet){
	var names = [], values = [];
	var hasIgnoreSet = !!(ignoreSet);

	Object.keys(tableInfo.columns).forEach((name) => {
		if (entity.hasOwnProperty(name) && (!hasIgnoreSet || !ignoreSet.has(name))){
			let val = entity[name];
			names.push(name);
			values.push(val);
		}
	});
	return {names: names, values: values};
}

// --------- /BaseDao Utilities --------- //

module.exports = BaseDao;



