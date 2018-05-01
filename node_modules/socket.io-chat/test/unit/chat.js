(function () {
	"use strict";

	var should = require('should');
	var mongodb = require('mongodb');
	var MongoClient = mongodb.MongoClient;

	var connect;
	var db = require('../../lib/db');
	var Chat = require('../../index');

	describe('test unit chat', function () {
		before(function (done) {
			MongoClient.connect('mongodb://127.0.0.1/test', function (error, conn) {
				if (error) throw error;

				connect = conn;
				Chat.setConnect(conn);

				done();
			});
		});
	});
}());