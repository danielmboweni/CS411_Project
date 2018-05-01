(function () {
	"use strict";

	/**
	 * @exports chatClient-request
	 */
	module.exports = {};

	/**
	 * @method authenticate
	 */
	module.exports.authenticate = function () {};

	/**
	 * @method create
	 *
	 * @desc Create chat
	 *
	 * @param {String} name
	 * @param {String} [title]
	 * @param {ObjectId[]} [members]
	 * @param {Object} [systemMessages]
	 * @param {Boolean} systemMessages.addMember
	 * @param {Boolean} systemMessages.removeMember
	 * @param {Boolean} systemMessages.leaveMember
	 * @param {Boolean} systemMessages.changeTitle
	 */
	module.exports.create = function () {};

	/**
	 * @method leave
	 *
	 * @desc Leave from chat
	 *
	 * @param {ObjectId} chatId
	 */
	module.exports.leave = function () {};

	/**
	 * @method addMember
	 *
	 * @desc Add member in chat
	 *
	 * @param {ObjectId} chatId
	 * @param {ObjectId} member
	 */
	module.exports.addMember = function () {};

	/**
	 * @method removeMember
	 *
	 * @desc Remove member from chat
	 *
	 * @param {ObjectId} chatId
	 * @param {ObjectId} member
	 */
	module.exports.removeMember = function () {};

	/**
	 * @method newMessage
	 *
	 * @desc Send new message
	 *
	 * @param {ObjectId} chatId
	 * @param {String} text
	 */
	module.exports.newMessage = function () {};

	/**
	 * @method changeTitle
	 *
	 * @desc Change title of chat
	 *
	 * @param {ObjectId} chatId
	 * @param {String} title
	 */
	module.exports.changeTitle = function () {};

	/**
	 * @method findMessagesLast
	 *
	 * @desc Find last @limit messages of chat
	 *
	 * @param {ObjectId} chatId
	 * @param {Object} [filter] - key and value of message (createdAt, authorId, etc.) { text: 'some text' }
	 * @param {Object} [sort] - { authorId: -1, createdAt: 1 }, positive - asc, negative - desc
	 * @param {Number} [limit]
	 * @param {ObjectId} [next] - return documents, before the specified _id
	 * @param {ObjectId} [prev] - return documents, after the specified _id
	 */
	module.exports.findMessagesLast = function () {};

	/**
	 * @method findMessagesFrom
	 *
	 * @desc Find @limit messages, starting from @messageId. Search down. (for load not received messages)
	 *
	 * @param {ObjectId} chatId
	 * @param {ObjectId} messageId
	 * @param {Object} [filter] - key and value of message (createdAt, authorId, etc.) { text: 'some text' }
	 * @param {Object} [sort] - { authorId: -1, createdAt: 1 }, positive - asc, negative - desc
	 * @param {Number} [limit]
	 * @param {ObjectId} [next] - return documents, before the specified _id
	 * @param {ObjectId} [prev] - return documents, after the specified _id
	 */
	module.exports.findMessagesFrom = function () {};

	/**
	 * @method findMessagesAt
	 *
	 * @desc Find @limit messages, starting from @messageId. Search up. (for history loading)
	 *
	 * @param {ObjectId} chatId
	 * @param {ObjectId} messageId
	 * @param {Object} [filter] - key and value of message (createdAt, authorId, etc.) { text: 'some text' }
	 * @param {Object} [sort] - { authorId: -1, createdAt: 1 }, positive - asc, negative - desc
	 * @param {Number} [limit]
	 * @param {ObjectId} [next] - return documents, before the specified _id
	 * @param {ObjectId} [prev] - return documents, after the specified _id
	 */
	module.exports.findMessagesAt = function () {};

	/**
	 * @method findChats
	 *
	 * @desc Find all our chats.
	 *
	 * @param {Object} [filter] - key and value of message (createdAt, authorId, etc.) { text: 'some text' }
	 * @param {Object} [sort] - positive - asc, negative - desc
	 * @param {Number} [limit]
	 * @param {ObjectId} [next] - return documents, before the specified _id
	 * @param {ObjectId} [prev] - return documents, after the specified _id
	 */
	module.exports.findChats = function () {};

	/**
	 * @method findChat
	 *
	 * @desc Find specific chat.
	 *
	 * @param {ObjectId} chatId
	 */
	module.exports.findChat = function () {};

}());