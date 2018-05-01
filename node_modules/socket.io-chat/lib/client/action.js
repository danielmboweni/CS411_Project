'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _flags = require('../flags');

var _flags2 = _interopRequireDefault(_flags);

var _error = require('../error');

var _error2 = _interopRequireDefault(_error);

var ClientAction = (function () {
	function ClientAction() {
		_classCallCheck(this, ClientAction);

		this.__validators = {};

		this.addValidator(_flags2['default'].AUTHOR, function () {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return options.chat.creatorId && options.chat.creatorId.equals(options.performer);
		}, 'Performer not author');

		this.addValidator(_flags2['default'].MEMBER, function () {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return options.chat.hasMember(options.performer);
		}, 'Performer not member');

		this.addValidator(_flags2['default'].OTHER, function () {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return true;
		});
	}

	_createClass(ClientAction, [{
		key: 'addValidator',
		value: function addValidator(flag, validator) {
			var message = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

			if (!flag) return false;
			if (!validator) return false;
			if (!(validator instanceof Function)) return false;
			if (this.__validators[flag]) return false;

			this.__validators[flag] = {
				cb: validator,
				message: message
			};

			return true;
		}
	}, {
		key: 'removeValidator',
		value: function removeValidator(flag) {
			return delete this.__validators[flag];
		}
	}, {
		key: 'validate',
		value: function validate(flag) {
			var _this = this;

			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			var result = false,
			    error;

			return new Promise(function (resolve, reject) {
				var result = false,
				    message = 'Unknown flag';

				if (_this.__validators[flag] && _this.__validators[flag].cb instanceof Function) {
					result = _this.__validators[flag].cb(options);
					message = _this.__validators[flag].message;
				}

				return result ? resolve(options) : reject(new _error2['default'](message));
			});
		}
	}]);

	return ClientAction;
})();

exports['default'] = ClientAction;
module.exports = exports['default'];
//# sourceMappingURL=action.js.map