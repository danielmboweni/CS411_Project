(function () {
	'use strict';

	var fs   = require('fs'),
	    path = require('path');

	module.exports.load = function (name) {
		var data = fs.readFileSync(path.join(__dirname, '.', name + '.json'));

		return JSON.parse(data);
	};
}());