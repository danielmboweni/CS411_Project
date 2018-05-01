(function () {
	'use strict';

	var http        = require('http'),
	    Chat        = require('./index'),
	    db          = require('./lib/db'),
	    mongodb     = require('mongodb'),
	    MongoClient = mongodb.MongoClient;

	var server = http.createServer(function (req, res) {});

	MongoClient.connect('mongodb://127.0.0.1/test', function (error, dbConnect) {
		server.listen(3000, '127.0.0.1');

		Chat.setConnect(dbConnect);

		var chatClient = new Chat.Client(server);

		chatClient.on('authenticate', function (socket, data, next) {
			db.getConnect(function (connect) {
				connect.collection('users').findOne({
					username: String(data.username),
					password: String(data.password)
				}, function (error, result) {
					if (result) {
						socket.auth = true;
						socket.user = result._id;
						next();
					} else {
						next(new Error('invalid credentials'));
					}
				});
			});
		});
	});
}());