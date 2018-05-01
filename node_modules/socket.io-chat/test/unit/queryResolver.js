(function () {
	"use strict";

	var debug         = require('debug')('test'),
		should        = require('should'),
		SchemaLoader  = require('../../lib/schema'),
		QueryResolver = require('../../lib/queryResolver');

	var schemaLoader = new SchemaLoader();

	var chatSchema    = schemaLoader.load(__dirname + '/../../schema/chat.json');
	var messageSchema = schemaLoader.load(__dirname + '/../../schema/message.json');

	describe('Query Resovler', function () {
		describe('query', function () {
			var queryResolver;

			beforeEach(function () {
				queryResolver = new QueryResolver();
				queryResolver.setSchema(chatSchema);
				queryResolver.setQuery({ _id: 1 });
			});

			it('not passing filter', function () {
				should.deepEqual(queryResolver.query, { _id: 1 });
			});

			it('passing null filter', function () {
				queryResolver.bindCriteria({ filter: null });
				should.deepEqual(queryResolver.query, { _id: 1 });
			});

			it('passing empty filter', function () {
				queryResolver.bindCriteria({ filter: {} });
				should.deepEqual(queryResolver.query, { _id: 1 });
			});

			it('passing filter with non exists keys', function () {
				queryResolver.bindCriteria({ filiter: { foo: 1 }});
				should.deepEqual(queryResolver.query, { _id: 1 });
			});

			it('cast type string', function () {
				queryResolver.bindCriteria({ filter: { name: 1 }});
				should.deepEqual(queryResolver.query, { _id: 1, name: '1' });

				queryResolver.query.name.should.be.a.String;
			});

			it('cast type date-time', function () {});
			it('cast type number', function () {});
			it('cast type object id', function () {});
			it('cast type object', function () {});

			it('replace query keys', function () {
				queryResolver.bindCriteria({ filter: { _id: 2 } });
				should.deepEqual(queryResolver.query, { _id: 1 });
			});

			it('passing array', function () {
				queryResolver.bindCriteria({ filter: [1,2,3] });
				should.deepEqual(queryResolver.query, { _id: 1 });
			});
		});

		describe('sort', function () {
			var queryResolver;

			beforeEach(function () {
				queryResolver = new QueryResolver();
				queryResolver.setSort({ _id: 1 });
				queryResolver.setSchema(chatSchema);
			});

			it('null', function () {
				queryResolver.bindCriteria({ sort: null });
				should.deepEqual(queryResolver.sort, { _id: 1 });
			});

			it('empty object', function () {
				queryResolver.bindCriteria({ sort: {} });
				should.deepEqual(queryResolver.sort, { _id: 1 });
			});

			it('not exists key', function () {
				queryResolver.bindCriteria({ sort: { foo: 1 } });
				should.deepEqual(queryResolver.sort, { _id: 1 });
			});

			it('replace key', function () {
				queryResolver.setSort({ _id: 1 });
				queryResolver.bindCriteria({ sort: { _id: -1 } });
				should.deepEqual(queryResolver.sort, { _id: 1 });
			});

			it('bad value negative', function () {
				queryResolver.setSort({ _id: 1 });
				queryResolver.bindCriteria({ sort: { name: -100 } });
				should.deepEqual(queryResolver.sort, { _id: 1, name: 1 });
			});

			it('bad value positive', function () {
				queryResolver.setSort({ _id: 1 });
				queryResolver.bindCriteria({ sort: { name: 55 } });
				should.deepEqual(queryResolver.sort, { _id: 1, name: 1 });
			});

			it('valid positive', function () {
				queryResolver.setSort({ _id: 1 });
				queryResolver.bindCriteria({ sort: { name: 1 } });
				should.deepEqual(queryResolver.sort, { _id: 1, name: 1 });
			});

			it('valid negative', function () {
				queryResolver.setSort({ _id: 1 });
				queryResolver.bindCriteria({ sort: { name: -1 } });

				should.deepEqual(queryResolver.sort, { _id: 1, name: -1 });
			});
		});

		describe('limit', function () {
			var queryResolver;

			beforeEach(function () {
				queryResolver = new QueryResolver();
				queryResolver.setSchema(chatSchema);
			});

			it('null', function () {
				queryResolver.bindCriteria({ limit: null });
				should.equal(queryResolver.limit, null);
			});

			it('undefined', function () {
				queryResolver.bindCriteria({ limit: undefined });
				should.equal(queryResolver.limit, null);
			});

			it('object', function () {
				queryResolver.bindCriteria({ limit: {} });
				should.equal(queryResolver.limit, 10);
			});

			it('negative', function () {
				queryResolver.bindCriteria({ limit: -50 });
				should.equal(queryResolver.limit, 50);
			});

			it('greater 50', function () {
				queryResolver.bindCriteria({ limit: 70 });
				should.equal(queryResolver.limit, 50);
			});

			it('greater negative 50', function () {
				queryResolver.bindCriteria({ limit: -80 });
				should.equal(queryResolver.limit, 50);
			});

			it('valid', function () {
				queryResolver.bindCriteria({ limit: 15 });
				should.equal(queryResolver.limit, 15);
			});
		});
	});
}());