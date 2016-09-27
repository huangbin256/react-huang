'use strict';
var BaseDao = require("./BaseDao.js");
var db = require("./db.js");

class ContactDao extends BaseDao{
	constructor(){
		super({entity: "contact",
					key: "id"});
	}
}

module.exports = {
	BaseDao: BaseDao,
	contact: new ContactDao()
};
