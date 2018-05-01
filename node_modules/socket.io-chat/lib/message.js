'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x14, _x15, _x16) { var _again = true; _function: while (_again) { var object = _x14, property = _x15, receiver = _x16; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x14 = parent; _x15 = property; _x16 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
	"use strict";

	var _ = require('underscore'),
	    util = require('util'),
	    db = require('./db'),
	    Model = require('./model'),
	    SchemaLoader = require('./schema'),
	    FLAGS = require('./flags'),
	    extend = require('extend'),
	    QueryResolver = require('./queryResolver'),
	    schemaLoader = new SchemaLoader();

	module.exports = function (options) {
		var collectionName = 'chats_messages',
		    _schema = schemaLoader.load(__dirname + '/../schema/message.json');

		options.collection && (collectionName = options.collection);
		options.schema && (_schema = extend(true, _schema, options.schema));

		var Message = (function (_Model) {
			_inherits(Message, _Model);

			_createClass(Message, [{
				key: 'defaults',
				value: function defaults() {
					return schemaLoader.defaults(_schema);
				}
			}]);

			function Message(props) {
				_classCallCheck(this, Message);

				_get(Object.getPrototypeOf(Message.prototype), 'constructor', this).call(this, props);

				this.setSchema(_schema);

				this.on('beforeValidate', function () {
					if (!this.get('createdAt')) {
						this.set('createdAt', new Date());
					}
				});
			}

			_createClass(Message, [{
				key: 'setAuthor',
				value: function setAuthor(id) {
					if (id && db.ObjectID.isValid(id)) {
						this.set('authorId', id);
					}
				}
			}, {
				key: 'setSystemAuthor',
				value: function setSystemAuthor() {
					this.setAuthor(new db.ObjectID("000000000000000000000000"));
				}
			}, {
				key: 'setChat',
				value: function setChat(chat) {
					if (chat) {
						this.set('chatId', chat.get('_id'));
					}
				}
			}, {
				key: 'setReceivers',
				value: function setReceivers(ids) {
					var filteredIds;

					if (ids) {
						filteredIds = ids.filter(function (id) {
							return db.ObjectID.isValid(id);
						});

						this.set('receivers', filteredIds);
					}
				}
			}, {
				key: 'setSystem',
				value: function setSystem(data) {
					this.set('type', 'system');
					this.set('system', data);
				}
			}, {
				key: 'setReaded',
				value: function setReaded(user) {
					var userId = new db.ObjectId(user);

					if (!userId) {
						return;
					}

					if (! ~this.receivers.map(String).indexOf(String(userId))) {
						return;
					}

					if (this.read && this.read.map(String).indexOf(String(userId))) {
						return;
					}

					if (!read) {
						this.set('read', []);
					}

					this.read.push(userId);
				}
			}, {
				key: 'addAttachments',
				value: function addAttachments() {
					var files = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

					_.each(files, function (file) {});
				}
			}, {
				key: 'collection',
				value: function collection() {
					return collectionName;
				}
			}], [{
				key: 'stream',
				value: function stream() {
					var criteria = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
					var streamOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

					var cursor;

					cursor = db.connect().collection(collectionName).find(criteria).stream(streamOptions);

					return cursor;
				}
			}, {
				key: 'collection',
				value: function collection() {
					return collectionName;
				}
			}, {
				key: 'schema',
				value: function schema() {
					return _schema;
				}
			}, {
				key: 'findLast',
				value: function findLast(dataChatId, user, count) {
					var flag = arguments.length <= 3 || arguments[3] === undefined ? FLAGS.RECEIVER : arguments[3];
					var criteria = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

					var chatId = db.ObjectId(dataChatId),
					    userId = db.ObjectId(user),
					    query = { chatId: chatId },
					    queryResolver = new QueryResolver();

					switch (flag) {
						case FLAGS.AUTHOR:
							query.authorId = userId;
							break;
						case FLAGS.RECEIVER:
							query.receivers = userId;
							break;
					}

					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).setQuery(query, criteria.filter).setSort({}, criteria.sort).setLimit(criteria.limit || count).setNext(criteria.next).find();
				}
			}, {
				key: 'findFrom',
				value: function findFrom(dataChatId, dataMessageId, user, count) {
					var flag = arguments.length <= 4 || arguments[4] === undefined ? FLAGS.RECEIVER : arguments[4];
					var criteria = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];

					var queryResolver = new QueryResolver(),
					    chatId = db.ObjectId(dataChatId),
					    messageId = db.ObjectId(dataMessageId),
					    userId = db.ObjectId(user),
					    query = { _id: { $gt: messageId }, chatId: chatId, receivers: userId };

					switch (flag) {
						case FLAGS.AUTHOR:
							query.authorId = userId;
							break;
						case FLAGS.RECEIVER:
							query.receivers = userId;
							break;
					}

					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).setQuery(query, criteria.filter).setSort({}, criteria.sort).setLimit(criteria.limit || count).find();
				}
			}, {
				key: 'findAt',
				value: function findAt(dataChatId, dataMessageId, user, count) {
					var flag = arguments.length <= 4 || arguments[4] === undefined ? FLAGS.RECEIVER : arguments[4];
					var criteria = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];

					var queryResolver = new QueryResolver(),
					    chatId = db.ObjectId(dataChatId),
					    messageId = db.ObjectId(dataMessageId),
					    userId = db.ObjectId(user),
					    query = { _id: { $lt: messageId }, chatId: chatId };

					switch (flag) {
						case FLAGS.AUTHOR:
							query.authorId = userId;
							break;
						case FLAGS.RECEIVER:
							query.receivers = userId;
							break;
					}

					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).setQuery(query, criteria.filter).setSort({}, criteria.sort).setLimit(criteria.limit || count).find();
				}
			}, {
				key: 'findUnreaded',
				value: function findUnreaded(user) {
					var flag = arguments.length <= 1 || arguments[1] === undefined ? FLAGS.RECEIVER : arguments[1];
					var criteria = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

					var userId = db.ObjectId(user),
					    query = {
						read: { $nin: [userId] }
					};

					switch (flag) {
						case FLAGS.AUTHOR:
							query.authorId = userId;break;
						case FLAGS.RECEIVER:
							query.receivers = userId;break;
					}

					return Model.find(Message, query).sort({ createdAt: -1 }).limit(20).bindCriteria(criteria);
				}
			}, {
				key: 'findAllLast',
				value: function findAllLast(user) {
					var flag = arguments.length <= 1 || arguments[1] === undefined ? FLAGS.RECEIVER : arguments[1];
					var criteria = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

					var userId = db.ObjectId(user),
					    query = {};

					switch (flag) {
						case FLAGS.AUTHOR:
							query.authorId = userId;break;
						case FLAGS.RECEIVER:
							query.receivers = userId;break;
					}

					return Model.find(Message, query).sort({ createdAt: -1 }).limit(20).bindCriteria(criteria);
				}
			}, {
				key: 'find',
				value: function find(query) {
					return Model.find(Message, query);
				}
			}, {
				key: 'findOne',
				value: function findOne(query) {
					return Model.findOne(Message, query);
				}
			}, {
				key: 'update',
				value: function update() {
					return Model.update.apply(Message, arguments);
				}
			}]);

			return Message;
		})(Model);

		return Message;
	};
})();
//# sourceMappingURL=message.js.map