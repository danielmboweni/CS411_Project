(function () {
	'use strict';

	var ObjectID = require('bson-objectid'),
	    debug = require('debug')('develop');

	var map = new Map();
	var ids = [], id;

	debug('start');

	for (var i = 0; i < 5000; i++) {
		id = new ObjectID();
		map.set(id, i);
		ids.push(id);
	}

	debug('end');

	debug(map.get(ids[500]));

	debug('idsNew');

	var idsNew = [];

	for (i = 0; i < 5000; i++) {
		id = new ObjectID();
		idsNew.push(id);
	}

	debug('idsNew end');

	debug('idsNew filter');

	idsNew.filter(function (idNew) {
		return idNew.equals(idsNew[500]);
	});

	debug('idsNew filter end');
}());