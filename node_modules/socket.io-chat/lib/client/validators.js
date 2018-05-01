'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.chatMessagesInc = chatMessagesInc;
exports.singlePrivateChat = singlePrivateChat;
exports.newChatOnGroup = newChatOnGroup;
exports.activeReadMessage = activeReadMessage;

function chatMessagesInc(options) {
	var count = options.chat.get('countMessages');

	if (!count) {
		count = 0;
	}

	options.chat.fill('lastMessageAt', new Date(), true);
	options.chat.fill('countMessages', count + 1, true);
	options.chat.save();
}

function singlePrivateChat(options, next) {
	if (options.chat.type === 'private') {
		this.model('chat').findEqual(options.chat).then(function (equalChat) {
			equalChat && (options.chat = equalChat);
			equalChat && (options.chat.isEqual = true);
			next();
		})['catch'](next);
	} else {
		next();
	}
}

function newChatOnGroup(options, next) {
	var chat;

	chat = new (this.model('chat'))();
	chat.set(options.chat.toJSON());

	options.chat = chat;

	next();
}

function activeReadMessage(options, next) {
	var sockets;

	if (!options.message.read) {
		options.message.set('read', []);
	}

	this.members.get(options.chat.get('members').map(String)).filter(function (socket) {
		return !!socket.isActive || String(socket.user) === String(options.message.authorId);
	}).forEach(function (socket) {
		options.message.read.push(socket.user);
	});

	next();
}
//# sourceMappingURL=validators.js.map