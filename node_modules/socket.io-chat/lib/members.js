'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
	'use strict';

	var Member = (function (_Array) {
		_inherits(Member, _Array);

		function Member() {
			_classCallCheck(this, Member);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			_get(Object.getPrototypeOf(Member.prototype), 'constructor', this).apply(this, args);
		}

		return Member;
	})(Array);

	var Members = (function () {
		function Members() {
			_classCallCheck(this, Members);

			this.__members = new Map();
		}

		_createClass(Members, [{
			key: 'add',
			value: function add(id, socket) {
				if (!this.__members.has(String(id))) {
					this.__members.set(String(id), new Member());
				}

				this.__members.get(String(id)).push(socket);

				return this;
			}
		}, {
			key: 'remove',
			value: function remove(id, socket) {
				var member, socketIndex;

				if (socket) {
					member = this.__members.get(String(id));

					if (member) {
						socketIndex = member.indexOf(socket);
						member.splice(socketIndex, 1);

						if (member.length === 0) {
							this.__members['delete'](String(id));
						}
					}
				} else {
					this.__members['delete'](String(id));
				}

				return this;
			}
		}, {
			key: 'get',
			value: function get(id) {
				var _this = this;

				var res, member;

				if (id instanceof Array) {
					res = [];

					id.forEach(function (id) {
						member = _this.__members.get(String(id));
						member && member.forEach(function (socket) {
							socket && res.push(socket);
						});
					});

					return res;
				} else {
					return this.__members.get(String(id));
				}
			}
		}, {
			key: 'isOnline',
			value: function isOnline(id) {
				return this.__members.has(String(id)) && this.__members.get(String(id)).length > 0;
			}
		}]);

		return Members;
	})();

	module.exports = Members;
})();
//# sourceMappingURL=members.js.map