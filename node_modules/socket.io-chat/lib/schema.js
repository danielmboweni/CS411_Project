'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function () {
	"use strict";

	var fs = require('fs');
	var _ = require('underscore');

	var SchemaLoader = (function () {
		function SchemaLoader() {
			_classCallCheck(this, SchemaLoader);
		}

		_createClass(SchemaLoader, [{
			key: 'load',
			value: function load(schemaPath) {
				var schema = fs.readFileSync(schemaPath);

				if (schema) {
					return JSON.parse(schema);
				}

				return null;
			}
		}, {
			key: 'defaults',
			value: function defaults(schema) {
				//console.time('defaults');

				var output = {};

				var walker = function walker(props, output) {
					_.each(props, function (prop, key) {
						if (prop.properties) {
							output[key] = {};
						}

						if (prop['default']) {
							if (_.isObject(prop['default']) && prop['default'].type) {

								output[key] = prop['default'].value ? global[prop['default'].type](prop['default'].value) : global[prop['default'].type]();
							} else if (_.isString(prop['default'])) {
								output[key] = ~['null', 'undefined'].indexOf(prop['default']) ? null : global[prop['default']]();
							}
						}

						if (prop.properties) {
							walker(prop.properties, output[key]);
						}
					});
				};

				walker(schema.properties, output);

				//console.timeEnd('defaults');

				return output;
			}
		}]);

		return SchemaLoader;
	})();

	module.exports = SchemaLoader;
})();
//# sourceMappingURL=schema.js.map