(function () {
	'use strict';

	var should      = require('should'),
		mongodb     = require('mongodb'),
		MongoClient = mongodb.MongoClient,
		connect,
		db          = require('../../lib/db'),
		Chat        = require('../../index'),
		http        = require('http'),
		faker       = require('faker'),
		server,
		prefixName  = 'testName-',
		debug       = require('debug')('test'),
		ClientSocket = require('../../lib/clientSocket');

	/**
	 * dummy socket
	 */
	var socket = {
		emit: function () {}
	};

	describe('Client socket', function () {
		describe('transform', function () {
			var clientSocket;

			beforeEach(function () {
				clientSocket = new ClientSocket();
			});

			describe('result', function () {
				it('transform', function (done) {
					socket.emit = function (event, data) {
						event.should.ok;
						data.should.be.a.Object;
						data.should.have.property('result');
						data.result.should.have.property('someKey', 'test data1');
						data.result.should.have.property('secondKey', 'data');


						done();
					};

					clientSocket.emitResult.transform = function (data, next) {
						data.should.ok;
						data.should.be.a.Object;
						data.should.have.property('someKey', 'test data');

						next.should.ok;
						next.should.be.a.Function;

						data.secondKey = 'data';
						data.someKey+= '1';

						next(data);
					};

					clientSocket.emitResult(socket, 'create', { someKey: 'test data' });
				});
			});

			describe('error', function () {
				it('transform', function (done) {
					socket.emit = function (event, data) {
						event.should.ok;
						data.should.be.a.Object;
						data.should.have.property('error');
						data.error.should.have.property('someKey', 'test data1');
						data.error.should.have.property('secondKey', 'data');

						done();
					};

					clientSocket.emitError.transform = function (data, next) {
						data.should.ok;
						data.should.be.a.Object;
						data.should.have.property('someKey', 'test data');

						next.should.ok;
						next.should.be.a.Function;

						data.secondKey = 'data';
						data.someKey+= '1';

						next(data);
					};

					clientSocket.emitError(socket, 'create', { someKey: 'test data' });
				});
			});
		});

		describe('transform on', function () {
			var clientSocket;

			beforeEach(function () {
				clientSocket = new ClientSocket();
			});

			describe('result', function () {
				it('create event', function (done) {
					socket.emit = function (event, data) {
						event.should.ok;
						event.should.equal('create');

						data.should.have.property('result');
						data.result.should.have.property('someKey', 'test data');
						data.result.should.have.property('key1', 'key1');
						data.result.should.have.property('key2', 'key2');

						done();
					};

					clientSocket.emitResult.transformOn('create', function (data, next) {
						data.should.ok;
						data.should.have.property('someKey', 'test data');
						data.should.not.have.property('key2', 'key2');

						data.key1 = 'key1';

						next(data);
					});

					clientSocket.emitResult.transformOn('create', function (data, next) {
						data.should.ok;
						data.should.have.property('someKey', 'test data');
						data.should.have.property('key1', 'key1');

						data.key2 = 'key2';

						next(data);
					});

					clientSocket.emitResult.transformOn('creates', function () {
						throw new Error;
					});

					clientSocket.emitResult(socket, 'create', { someKey: 'test data' });
				});
			});

			describe('error', function () {
				it('create event', function (done) {
					socket.emit = function (event, data) {
						event.should.ok;
						event.should.equal('create');

						data.should.have.property('error');
						data.error.should.have.property('someKey', 'test data');
						data.error.should.have.property('key1', 'key1');
						data.error.should.have.property('key2', 'key2');

						done();
					};

					clientSocket.emitError.transformOn('create', function (data, next) {
						data.should.ok;
						data.should.have.property('someKey', 'test data');
						data.should.not.have.property('key2', 'key2');

						data.key1 = 'key1';

						next(data);
					});

					clientSocket.emitError.transformOn('create', function (data, next) {
						data.should.ok;
						data.should.have.property('someKey', 'test data');
						data.should.have.property('key1', 'key1');

						data.key2 = 'key2';

						next(data);
					});

					clientSocket.emitError.transformOn('creates', function () {
						throw new Error;
					});

					clientSocket.emitError(socket, 'create', { someKey: 'test data' });
				});
			});
		});
	});
}());