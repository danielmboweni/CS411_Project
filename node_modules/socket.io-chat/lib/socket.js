"use strict";

(function () {
	"use strict";

	/**
  * @mixin
  */
	module.exports = {
		emitError: function emitError(event, data) {
			this.emit(event, { error: data });
		},
		emitResult: function emitResult(event, data) {
			this.emit(event, { result: data });
		}
	};
})();
//# sourceMappingURL=socket.js.map