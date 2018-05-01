'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _error = require('../error');

var _error2 = _interopRequireDefault(_error);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('develop');

function catchErrorMessage(error) {
	switch (error.type) {
		case 'validation':
		case 'client':
			return error.message;
		default:
			// TODO: debug(error.stack);
			debug(error.stack);
			return 'Unknown error';
	}
}

/**
 * @function socketError
 * @param {String} event
 * @param {Error|String} error
 * @returns {Error}
 */
function socketError(event, error) {
	var sError = new Error();

	sError.event = String(event);

	switch (Object.prototype.toString.call(error)) {
		case '[object Error]':
			sError.message = error.message;
			break;
		case '[object String]':
			sError.message = error;
			break;
		default:
			sError.message = String(error);
	}

	return sError;
}

var ClientSocket = (function () {
	function ClientSocket() {
		var _this = this;

		_classCallCheck(this, ClientSocket);

		this.emitResult.transform = function (data, next) {
			next(data);
		};

		this.emitError.transform = function (data, next) {
			next(data);
		};

		this.emitError.transformOn = function (event, cb) {
			if (!_this.emitError.__transforms) {
				_this.emitError.__transforms = {};
			}

			if (!_this.emitError.__transforms[event]) {
				_this.emitError.__transforms[event] = [];
			}

			_this.emitError.__transforms[event].push(cb);

			return _this.emitResult;
		};

		this.emitResult.transformOn = function (event, cb) {
			if (!_this.emitResult.__transforms) {
				_this.emitResult.__transforms = {};
			}

			if (!_this.emitResult.__transforms[event]) {
				_this.emitResult.__transforms[event] = [];
			}

			_this.emitResult.__transforms[event].push(cb);

			return _this.emitResult;
		};
	}

	_createClass(ClientSocket, [{
		key: 'emitError',
		value: function emitError(socket, event, data) {
			var index = 0,
			    transforms = this.emitError.__transforms || {},
			    transformCb;

			function nextTransform(data) {
				transformCb = transforms[event] ? transforms[event][index] : null;

				if (transformCb) {
					transformCb(data, function (data) {
						index++;

						if (transforms.length === index) {
							socket.emit(event, { error: data });
						} else {
							nextTransform(data);
						}
					});
				} else {
					socket.emit(event, { error: data });
				}
			}

			this.emitError.transform(data, function (data) {
				nextTransform(data);
			});
		}
	}, {
		key: 'emitResult',
		value: function emitResult(socket, event, data) {
			var index = 0,
			    transforms = this.emitResult.__transforms || {},
			    transformCb;

			function nextTransform(data) {
				transformCb = transforms[event] ? transforms[event][index] : null;

				if (transformCb) {
					transformCb(data, function (data) {
						index++;

						if (transforms.length === index) {
							socket.emit(event, { result: data });
						} else {
							nextTransform(data);
						}
					});
				} else {
					socket.emit(event, { result: data });
				}
			}

			this.emitResult.transform(data, function (data) {
				nextTransform(data);
			});
		}
	}, {
		key: 'onAuthenticate',
		value: function onAuthenticate(client, socket) {
			var _this2 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			client.emit(client.EVENTS.AUTHENTICATE, socket, data, function (error) {
				if (error) {
					return _this2.emitError(socket, 'login', { message: error.message || error });
				}

				if (!client.authorize(socket)) {
					return;
				}

				client.members.add(socket.user, socket);

				_this2.emitResult(socket, 'login', { user: socket.user });
				_this2.emitResult(socket, 'authenticate', { user: socket.user });
			});
		}
	}, {
		key: 'onCreate',
		value: function onCreate(client, socket) {
			var _this3 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			client.create(data, socket.user).then(function (chat) {
				_this3.emitResult(socket, client.EVENTS.CREATE, { message: 'Chat created', data: chat.toJSON() });

				client.rooms.addMembers(chat.get('_id'), client.members.get(chat.get('members')));

				client.members.get(chat.get('members')).forEach(function (socket) {
					_this3.emitResult(socket, client.EVENTS.JOIN, {
						message: 'Join to chat',
						data: chat.toJSON()
					});
				});
			})['catch'](function (error) {
				return _this3.emitError(socket, client.EVENTS.CREATE, { message: error.message });
			});
		}
	}, {
		key: 'onLeave',
		value: function onLeave(client, socket) {
			var _this4 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var chat;

			client.model('chat').findById(data.chatId).then(function (result) {
				if (!(chat = result)) {
					throw new _error2['default']('Chat not found');
				}

				return client.leave(chat, socket.user);
			}).then(function (member) {
				client.rooms.removeMember(chat.get('_id'), member);

				var receivers = chat.get('members').concat(member),
				    sockets = client.members.get(receivers);

				if (chat.systemMessages && chat.systemMessages.leaveMember) {
					client.newSystemMessage(chat, { whoLeaved: member }).then(function (message) {
						sockets.forEach(function (socket) {
							_this4.emitResult(socket, client.EVENTS.NEWSYSTEMMESSAGE, {
								message: 'New system message', data: message.toJSON(), chatId: chat.get('_id')
							});
						});
					});
				}

				sockets.forEach(function (socket) {
					_this4.emitResult(socket, client.EVENTS.LEAVE, {
						message: 'The member leaved',
						data: member,
						chatId: chat.get('_id')
					});
				});
			})['catch'](function (error) {
				_this4.emitError(socket, client.EVENTS.LEAVE, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onAddMember',
		value: function onAddMember(client, socket) {
			var _this5 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var chat, countBefore, countAfter;

			client.model('chat').findById(data.chatId).then(function (result) {
				if (!(chat = result)) {
					throw new _error2['default']('Chat not found');
				}

				countBefore = chat.get('members').length;

				return client.addMember(chat, data.member, socket.user);
			}).then(function (member) {
				countAfter = chat.get('members').length;

				if (countBefore === countAfter) {
					return;
				}

				var receivers = chat.get('members'),
				    sockets = client.members.get(receivers);

				client.rooms.addMembers(chat.get('_id'), member);

				if (chat.systemMessages && chat.systemMessages.addMember) {
					client.newSystemMessage(chat, { whoAdded: socket.user, whomAdded: member }).then(function (message) {
						sockets.forEach(function (socket) {
							_this5.emitResult(socket, client.EVENTS.NEWMESSAGE, {
								message: 'New system message',
								data: message.toJSON(),
								chatId: chat.get('_id')
							});
						});
					});
				}

				sockets.forEach(function (socket) {
					_this5.emitResult(socket, client.EVENTS.ADDMEMBER, {
						message: 'The member added',
						data: member,
						chatId: chat.get('_id')
					});
				});
			})['catch'](function (error) {
				_this5.emitError(socket, client.EVENTS.ADDMEMBER, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onRemoveMember',
		value: function onRemoveMember(client, socket) {
			var _this6 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var chat, countBefore, countAfter;

			client.model('chat').findById(data.chatId).then(function (result) {
				if (!(chat = result)) {
					throw new _error2['default']('Chat not found');
				}

				countBefore = chat.get('members').length;

				return client.removeMember(chat, data.member, socket.user);
			}).then(function (member) {
				countAfter = chat.get('members').length;

				if (countBefore === countAfter) {
					return;
				}

				client.rooms.removeMember(chat.get('_id'), member);

				var receivers = chat.get('members').concat(member),
				    sockets = client.members.get(receivers);

				if (chat.systemMessages && chat.systemMessages.removeMember) {
					client.newSystemMessage(chat, { whoRemove: socket.user, whomRemove: member }).then(function (message) {
						sockets.forEach(function (socket) {
							_this6.emitResult(socket, client.EVENTS.NEWMESSAGE, {
								message: 'New system message',
								data: message.toJSON(),
								chatId: chat.get('_id')
							});
						});
					});
				}

				sockets.forEach(function (socket) {
					_this6.emitResult(socket, client.EVENTS.REMOVEMEMBER, {
						message: 'The member removed',
						data: member,
						chatId: chat.get('_id')
					});
				});
			})['catch'](function (error) {
				_this6.emitError(socket, client.EVENTS.REMOVEMEMBER, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onNewMessage',
		value: function onNewMessage(client, socket) {
			var _this7 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var chat;

			client.model('chat').findById(data.chatId).then(function (result) {
				if (!(chat = result)) {
					throw new _error2['default']('Chat not found');
				}

				return client.newMessage(chat, data, socket.user);
			}).then(function (message) {
				client.members.get(chat.get('members')).forEach(function (socket) {
					_this7.emitResult(socket, client.EVENTS.NEWMESSAGE, {
						message: 'New message',
						data: message.toJSON(),
						chatId: chat.get('_id')
					});
				});
			})['catch'](function (error) {
				_this7.emitError(socket, client.EVENTS.NEWMESSAGE, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onFindMessagesLast',
		value: function onFindMessagesLast(client, socket) {
			var _this8 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			client.findLastMessages(data.chatId, socket.user, data.limit, FLAGS.RECEIVER, {
				filter: data.filter, sort: data.sort, limit: data.limit, next: data.next, prev: data.prev
			}).then(function (messages) {
				_this8.emitResult(socket, client.EVENTS.FINDMESSAGESLAST, {
					chatId: data.chatId,
					data: messages
				});
			})['catch'](function (error) {
				_this8.emitError(socket, client.EVENTS.FINDMESSAGESLAST, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onFindMessagesFrom',
		value: function onFindMessagesFrom(client, socket) {
			var _this9 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			client.findFromMessages(data.chatId, data.messageId, socket.user, data.limit, FLAGS.RECEIVER, {
				filter: data.filter, sort: data.sort, limit: data.limit, next: data.next, prev: data.prev
			}).then(function (messages) {
				_this9.emitResult(socket, client.EVENTS.FINDMESSAGESFROM, {
					chatId: data.chatId,
					data: messages
				});
			})['catch'](function (error) {
				_this9.emitError(socket, client.EVENTS.FINDMESSAGESFROM, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onFindMessagesAt',
		value: function onFindMessagesAt(client, socket) {
			var _this10 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			client.findAtMessages(data.chatId, data.messageId, socket.user, data.limit, FLAGS.RECEIVER, {
				filter: data.filter, sort: data.sort, limit: data.limit, next: data.next, prev: data.prev
			}).then(function (messages) {
				_this10.emitResult(socket, client.EVENTS.FINDMESSAGESAT, { chatId: data.chatId, data: messages });
			})['catch'](function (error) {
				_this10.emitError(socket, client.EVENTS.FINDMESSAGESAT, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onFindChat',
		value: function onFindChat(client, socket) {
			var _this11 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			client.findChatById(socket.user, data.chatId).then(function (chat) {
				_this11.emitResult(socket, client.EVENTS.FINDCHAT, { data: chat });
			})['catch'](function (error) {
				_this11.emitError(socket, client.EVENTS.FINDCHAT, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onFindChats',
		value: function onFindChats(client, socket) {
			var _this12 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			client.findChats(socket.user, data.limit, {
				filter: data.filter, sort: data.sort, limit: data.limit, next: data.next, prev: data.prev
			}).then(function (chats) {
				_this12.emitResult(socket, client.EVENTS.FINDCHATS, { data: chats });
			})['catch'](function (error) {
				_this12.emitError(socket, client.EVENTS.FINDCHATS, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onChangeTitle',
		value: function onChangeTitle(client, socket) {
			var _this13 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var oldTitle;

			client.model('chat').findById(data.chatId).then(function (chat) {
				if (!chat) {
					throw new _error2['default']('Chat not found');
				}

				oldTitle = String(chat.get('title'));

				return client.changeTitle(chat, data.title, socket.user);
			}).then(function (chat) {
				var receivers = chat.get('members'),
				    sockets = client.members.get(receivers);

				if (chat.systemMessages && chat.systemMessages.changeTitle) {
					client.newSystemMessage(chat, {
						changed: socket.user, oldTitle: oldTitle, newTitle: chat.get('title')
					}).then(function (message) {
						sockets.forEach(function (socket) {
							_this13.emitResult(socket, client.EVENTS.NEWMESSAGE, {
								message: 'New system message',
								data: message.toJSON(),
								chatId: chat.get('_id')
							});
						});
					});
				}

				sockets.forEach(function (socket) {
					_this13.emitResult(socket, client.EVENTS.CHANGETITLE, {
						message: 'Title changed',
						data: chat.get('title'),
						chatId: chat.get('_id')
					});
				});
			})['catch'](function (error) {
				_this13.emitError(socket, client.EVENTS.CHANGETITLE, { message: catchErrorMessage(error) });
			});
		}
	}, {
		key: 'onReadMessage',
		value: function onReadMessage(client, socket) {
			var _this14 = this;

			var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var chat;

			if (!data.messagesId) {
				messagesId = [];
			}

			data.messagesId = data.messagesId.slice(0, 10);

			Promise.all([client.model('chat').findOne({ _id: data.chatId, members: socket.user }).exec(), client.model('message').find({
				_id: { $in: data.messagesId },
				chatId: data.chatId,
				receivers: socket.user,
				read: { $nin: data.messagesId }
			}).exec()]).then(function (results) {
				var messages = results[1];
				chat = results[0];

				if (!chat) {
					throw new _error2['default']('Chat not found');
				}

				return Promise.all(messages.map(function (message) {
					return client.readMessage(chat, message, socket.user);
				}));
			}).then(function (results) {
				sockets = client.members.get(chat.get('members'));
				sockets.forEach(function (socket) {
					_this14.emitResult(socket, client.EVENTS.READMESSAGE, {
						message: 'Message readed',
						messagesId: results.map(function (message) {
							return message._id;
						}),
						chatId: chat._id
					});
				});
			})['catch'](function (error) {
				_this14.emitError(socket, client.EVENTS.READMESSAGE, { message: catchErrorMessage(error) });
			});
		}
	}]);

	return ClientSocket;
})();

exports['default'] = ClientSocket;
module.exports = exports['default'];
//# sourceMappingURL=socket.js.map