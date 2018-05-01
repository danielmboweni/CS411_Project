'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
	'use strict';

	var Room = (function (_Array) {
		_inherits(Room, _Array);

		function Room() {
			_classCallCheck(this, Room);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			_get(Object.getPrototypeOf(Room.prototype), 'constructor', this).apply(this, args);
		}

		return Room;
	})(Array);

	var Rooms = (function () {
		function Rooms() {
			_classCallCheck(this, Rooms);

			this.__rooms = new Map();
		}

		_createClass(Rooms, [{
			key: 'create',
			value: function create(id) {
				this.__rooms.set(String(id), new Room());

				return this.get(String(id));
			}
		}, {
			key: 'remove',
			value: function remove(id) {
				this.__rooms['delete'](String(id));

				return this;
			}
		}, {
			key: 'get',
			value: function get(id) {
				return this.__rooms.get(String(id));
			}
		}, {
			key: 'exist',
			value: function exist(id) {
				return this.__rooms.has(String(id));
			}
		}, {
			key: 'addMembers',
			value: function addMembers(idRoom, member) {
				var room = this.__rooms.get(String(idRoom));

				if (!room) {
					room = this.create(String(idRoom));
				}

				if (!(member instanceof Array)) {
					member = [member];
				}

				member.forEach(function (member) {
					if (! ~room.indexOf(String(member))) {
						room.push(String(member));
					}
				});

				return room;
			}
		}, {
			key: 'removeMember',
			value: function removeMember(idRoom, member) {
				var room = this.__rooms.get(String(idRoom)),
				    index = -1;

				if (room) {
					if (!(member instanceof Array)) {
						member = [member];
					}

					member.forEach(function (member) {
						index = room.indexOf(String(member));

						~index && room.splice(index, 1);
					});
				}

				return this;
			}
		}]);

		return Rooms;
	})();

	module.exports = Rooms;
})();
//# sourceMappingURL=rooms.js.map