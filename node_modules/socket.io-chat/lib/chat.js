'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
	var _ = require('underscore'),
	    util = require('util'),
	    debug = require('debug')('develop'),
	    db = require('./db'),
	    SchemaLoader = require('./schema'),
	    Model = require('./model'),
	    extend = require('extend'),
	    QueryResolver = require('./queryResolver'),
	    schemaLoader = new SchemaLoader();

	var sl = Array.prototype.slice;

	module.exports = function () {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var collectionName = 'chats',
		    _schema = schemaLoader.load(__dirname + '/../schema/chat.json');

		options.collection && (collectionName = options.collection);
		options.schema && (_schema = extend(true, _schema, options.schema));

		var Chat = (function (_Model) {
			_inherits(Chat, _Model);

			_createClass(Chat, [{
				key: 'defaults',
				value: function defaults() {
					return schemaLoader.defaults(_schema);
				}
			}]);

			function Chat(props) {
				_classCallCheck(this, Chat);

				_get(Object.getPrototypeOf(Chat.prototype), 'constructor', this).call(this, props);

				this.setSchema(_schema);

				this.on('beforeValidate', function () {
					this.set('type', this.determinateType());
				});
			}

			_createClass(Chat, [{
				key: 'setCreator',
				value: function setCreator(id) {
					if (db.ObjectID.isValid(id)) {
						this.set('creatorId', db.ObjectId(id));
						this.addMember(id);
					}

					return this;
				}
			}, {
				key: 'setTitle',
				value: function setTitle() {
					var title = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

					this.set('title', String(title));

					return this;
				}
			}, {
				key: 'addMember',
				value: function addMember(id) {
					var index, memberId;

					if (db.ObjectID.isValid(id)) {
						index = this.indexMember(id);
						memberId = db.ObjectId(id);

						if (index === -1) {
							this.get('members').push(memberId);
							this.$addToSet('members', memberId, true);
						}
					}

					return this;
				}
			}, {
				key: 'removeMember',
				value: function removeMember(id) {
					var index = this.indexMember(id);

					if (~index) {
						if (this.get('members')[index].equals(this.get('creatorId'))) {
							return this;
						}

						this.get('members').splice(index, 1);
						this.$pull('members', db.ObjectId(id));
					}

					return this;
				}
			}, {
				key: 'indexMember',
				value: function indexMember(id) {
					var index;

					id = db.ObjectID.isValid(id) ? db.ObjectID(id) : null;

					index = _.findIndex(this.get('members'), function (member) {
						return member && member.equals(id);
					});

					return index;
				}
			}, {
				key: 'hasMember',
				value: function hasMember(id) {
					return !! ~this.indexMember(id);
				}
			}, {
				key: 'incCountMessages',
				value: function incCountMessages() {
					if (typeof this.get('countMessages') !== 'undefined') {
						this.set('countMessages', this.get('countMessages'));
					}
				}
			}, {
				key: 'collection',
				value: function collection() {
					return collectionName;
				}
			}, {
				key: 'determinateType',
				value: function determinateType() {
					if (this.get('members').length <= 2) {
						return 'private';
					}

					if (this.get('members').length > 2) {
						return 'group';
					}

					return null;
				}
			}], [{
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
				key: 'fill',
				value: function fill(props, isAtomic) {
					var model = new Chat();

					model.isNew = false;
					model.fill(props, !!isAtomic);

					return model;
				}
			}, {
				key: 'findById',
				value: function findById(id) {
					var criteria = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

					var chatId = db.ObjectId(id),
					    query,
					    queryResolver = new QueryResolver();

					query = { _id: chatId };

					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).setQuery(query, criteria.filter).findOne().then(function (result) {
						var m = Chat.fill(result);

						return result && Chat.fill(result);
					});
				}
			}, {
				key: 'findByOwner',
				value: function findByOwner(id, creatorId) {
					var criteria = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

					var chatId,
					    chatCreatorId,
					    query,
					    queryResolver = new QueryResolver();

					chatId = db.ObjectId(id);
					chatCreatorId = db.ObjectId(creatorId);

					query = { _id: chatId, creatorId: chatCreatorId };
					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).setQuery(query, criteria.filter).findOne().then(function (result) {
						return result && Chat.fill(result);
					});
				}
			}, {
				key: 'findByMember',
				value: function findByMember(id, memberId) {
					var criteria = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

					var chatId,
					    chatMemberId,
					    query,
					    queryResolver = new QueryResolver();

					chatId = db.ObjectId(id);
					chatMemberId = db.ObjectId(memberId);

					query = { _id: chatId, members: chatMemberId };
					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).setQuery(query, criteria.filter).findOne().then(function (result) {
						return result && Chat.fill(result);
					});
				}
			}, {
				key: 'findAllByMember',
				value: function findAllByMember(memberId, count) {
					var criteria = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

					var chatMemberId,
					    query,
					    queryResolver = new QueryResolver();

					chatMemberId = db.ObjectId(memberId);

					query = { members: chatMemberId };
					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).addQuery(query).bindCriteria(criteria).find();
				}
			}, {
				key: 'findEqual',
				value: function findEqual(chatModel) {
					var queryResolver = new QueryResolver(),
					    query = {
						_id: db.ObjectId(chatModel.get('_id')),
						members: chatModel.get('members').map(db.ObjectId)
					};

					queryResolver.setSchema(_schema);

					return queryResolver.collection(collectionName).findOne(query).then(function (result) {
						return result && Chat.fill(result);
					});
				}
			}, {
				key: 'find',
				value: function find(query) {
					return Model.find(Chat, query);
				}
			}, {
				key: 'findOne',
				value: function findOne(query) {
					return Model.findOne(Chat, query);
				}
			}, {
				key: 'update',
				value: function update() {
					return Model.update.apply(Model, arguments);
				}
			}]);

			return Chat;
		})(Model);

		return Chat;
	};
})();
//# sourceMappingURL=chat.js.map