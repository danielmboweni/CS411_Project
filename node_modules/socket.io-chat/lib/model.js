'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _jsonschema = require('jsonschema');

var _events = require('events');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _queryResolver2 = require('./queryResolver2');

var _queryResolver22 = _interopRequireDefault(_queryResolver2);

var debug = (0, _debug2['default'])('develop');
var sl = Array.prototype.slice;
var typeOf = function typeOf(object) {
	return Object.prototype.toString.call(object).replace(/\[object\s(\w+)\]/, '$1');
};

var Model = (function (_EventEmitter) {
	_inherits(Model, _EventEmitter);

	function Model() {
		var _this = this;

		var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Model);

		_get(Object.getPrototypeOf(Model.prototype), 'constructor', this).call(this);

		this._id = new _db2['default'].ObjectID();
		this.isNew = true;
		console.log('defaults', this.defaults());
		_underscore2['default'].each(this.defaults(), function (value, key) {
			_this[key] = props[key] ? props[key] : value;
		});

		this.__defaultAttrs = Object.keys(this.defaults());
		this.__readonlyAttrs = [];
		this.__atomics = {};
	}

	_createClass(Model, [{
		key: 'save',
		value: function save() {
			var _this2 = this;

			var cb = sl.call(arguments, -1)[0];

			if (!this.isNew) {
				return this.update.apply(this, arguments);
			}

			if (this.isValid()) {
				this.set('_id', new _db2['default'].ObjectID());
				this.emit('beforeSave');

				_db2['default'].getConnect(function (connect) {
					connect.collection(_this2.collection()).insert(_this2.toJSON(), {}, function (error, result) {
						if (!error) {
							_this2.isNew = false;
							_this2.__atomics = {};
						}

						cb && cb(error, _this2);
					});
					_this2.emit('save');
				});
			} else {
				cb(this.validationError);
			}

			return this;
		}
	}, {
		key: 'update',
		value: function update() {
			var _this3 = this;

			var query, data, cb, modelId;

			modelId = _db2['default'].ObjectID(this.get('_id'));
			query = { _id: modelId };
			cb = sl.call(arguments, -1)[0];
			data = {};

			if (this.isValid()) {
				_underscore2['default'].each(this.__atomics, function (atomic, key) {
					if (Object.keys(atomic).length) {
						delete atomic._id;

						data[key] = atomic;
					}
				});

				if (!Object.keys(data).length) {
					return cb && cb(null, this);
				}

				_db2['default'].getConnect(function (connect) {
					//debug('update', query);

					connect.collection(_this3.collection()).update(query, data, function (error, result) {
						if (!error) {
							_this3.isNew = false;
							_this3.__atomics = {};
						}

						cb && cb(error, _this3);
					});
				});
			} else {
				cb(this.validationError);
			}

			return this;
		}
	}, {
		key: 'isValid',
		value: function isValid() {
			var result, error;

			result = this.validate();

			if (result) {
				error = new Error(result.message);
				error.type = 'validation';

				this.validationError = error;
			}

			return !result;
		}
	}, {
		key: 'validate',
		value: function validate() {
			var validator = new _jsonschema.Validator(),
			    result = validator.validate(this.toJSON(), this.getSchema());

			this.emit('beforeValidate');

			if (result.errors.length) {
				return new Error(result.errors[0].stack);
			}

			this.emit('validate');

			return null;
		}
	}, {
		key: 'setSchema',
		value: function setSchema(schema) {
			this.schema = schema;

			var readonlyAttrs = [];
			var path = [];

			function walk(properties) {
				_underscore2['default'].each(properties, function (prop, key) {
					path.push(key);

					if (prop.readonly) {
						readonlyAttrs.push(path.join('.'));
					}

					if (prop.properties) {
						walk(prop.properties);
					} else {
						path = [];
					}
				});
			}

			walk(this.schema.properties);

			this.__readonlyAttrs = readonlyAttrs;
		}
	}, {
		key: 'getSchema',
		value: function getSchema() {
			return this.schema;
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return _underscore2['default'].clone(_underscore2['default'].pick(this, this.__defaultAttrs));
		}
	}, {
		key: 'fill',
		value: function fill(key, value) {
			var _this4 = this;

			var isAtomic = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			if (_underscore2['default'].isBoolean(arguments[1])) {
				_underscore2['default'].each(key, function (value, key1) {
					_this4.fill(key1, value);
				});
			}

			if (~this.__defaultAttrs.indexOf(key)) {
				this[key] = value;

				if (isAtomic) {
					this.__addAtomic('set', key, value);
				}
			}

			return this;
		}
	}, {
		key: 'set',
		value: function set(key, value) {
			var _this5 = this;

			var path = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

			if (arguments.length === 1) {
				_underscore2['default'].each(key, function (value, key) {
					_this5.set(key, value, path.push(key));
				});
			} else {
				path = [key];
			}

			if (~this.__defaultAttrs.indexOf(key) && ! ~this.__readonlyAttrs.indexOf(path.join('.'))) {
				this[key] = value;

				if (~['Number', 'String', 'Data', 'Boolean', 'Object', 'Null'].indexOf(typeOf(value))) {
					this.__addAtomic('set', key, value);
				}
			}

			return this;
		}
	}, {
		key: 'get',
		value: function get(key) {
			if (~this.__defaultAttrs.indexOf(key)) {
				return this[key];
			}
		}
	}, {
		key: '$push',
		value: function $push(field, value) {
			var isEach = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			isEach ? this.get(field) && this.__addAtomic('push', field, { $each: value }) : this.get(field) && this.__addAtomic('push', field, value);
		}
	}, {
		key: '$addToSet',
		value: function $addToSet(field, value) {
			var isEach = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			isEach ? this.get(field) && this.__addAtomic('addToSet', field, { $each: value }) : this.get(field) && this.__addAtomic('addToSet', field, value);
		}
	}, {
		key: '$pull',
		value: function $pull(field, value) {
			this.get(field) && this.__addAtomic('pull', field, value);
		}
	}, {
		key: '__addAtomic',
		value: function __addAtomic(type, field, value) {
			if (!this.__atomics['$' + type]) {
				this.__atomics['$' + type] = {};
			}

			if (_underscore2['default'].isObject(value) && Object.keys(value).length === 1 && /^\$/.test(Object.keys(value)[0])) {
				switch (Object.keys(value)[0]) {
					case '$each':
						{
							if (!this.__atomics['$' + type][field]) {
								this.__atomics['$' + type][field] = { $each: [] };
							}

							this.__atomics['$' + type][field].$each.push(value.$each);

							break;
						}
				}
			} else {
				this.__atomics['$' + type][field] = value;
			}
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this.removeAllListeners();
			this.emit('destroy');
		}
	}], [{
		key: 'find',
		value: function find(Model, query) {
			var queryResolver = new _queryResolver22['default'](Model);

			return queryResolver.find(query);
		}
	}, {
		key: 'findOne',
		value: function findOne(Model, query) {
			var queryResolver = new _queryResolver22['default'](Model);

			return queryResolver.findOne(query);
		}
	}, {
		key: 'update',
		value: function update() {
			var _this6 = this,
			    _arguments2 = arguments;

			_db2['default'].getConnect(function (connect) {
				var collection = connect.collection(_this6.collection());

				collection.update.apply(collection, Array.prototype.slice.call(_arguments2));
			});
		}
	}]);

	return Model;
})(_events.EventEmitter);

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=model.js.map