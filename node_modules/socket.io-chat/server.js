(function () {
	'use strict';

	var http        = require('http');
	var Chat        = require('./index');
	var statics     = require('node-static');
	var db          = require('./lib/db');
	var mongodb     = require('mongodb');
	var MongoClient = mongodb.MongoClient;

	var file = new statics.Server('./public');

	var server = http.createServer(function (req, res) {
		req.addListener('end', function () {
			file.serve(req, res);
		}).resume();
	});

	MongoClient.connect('mongodb://127.0.0.1/test', function (error, dbConnect) {
		server.listen(3000, '127.0.0.1');

		Chat.setConnect(dbConnect);

		var chatClient = new Chat.Client(server);

		chatClient.on('authenticate', function (socket, data, next) {
			db.getConnect((function (s) {
				return function (connect) {
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
				};
			}(socket)));
		});

		chatClient.on('connection', function () {
			//console.log(this.io.sockets.sockets.length);
		});

		chatClient.on('disconnect', function () {
			//console.log(this.io.sockets.sockets.length);
		});

		chatClient.on('error', function (socket, event, error) {
			console.log('client error', event, error);
			console.log('client error', event, error.stack);
			//socket.emit('error');
		});
	});


}());