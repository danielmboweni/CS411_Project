'use strict';

var ObjectID = require('bson-objectid');
//var ObjectID = require('mongodb').ObjectID;

var _connect;

module.exports = {
	setConnect: function setConnect(externalConnect) {
		_connect = externalConnect;
	},
	getConnect: function getConnect(cb, errorCb) {
		_connect ? cb(_connect) : errorCb && errorCb(new Error('connect is not ready'));
	},
	connect: function connect() {
		return _connect;
	},
	ObjectID: ObjectID,
	ObjectId: function ObjectId(id) {
		return ObjectID.isValid(id) ? ObjectID(id) : null;
	}
};
//# sourceMappingURL=db.js.map