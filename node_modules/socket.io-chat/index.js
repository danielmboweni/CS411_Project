(function () {
	"use strict";

	var db         = require('./lib/db');
	var ChatClient = require('./lib/client');
	var colors     = require('colors');

	console.log('--------------------------------------------'.yellow);
	console.log('* Develop edition. Don`t use in production.'.yellow);
	console.log('--------------------------------------------'.yellow);

	module.exports = {
		setConnect: db.setConnect,
		getConnect: db.getConnect,
		Client:     ChatClient
	};

}());