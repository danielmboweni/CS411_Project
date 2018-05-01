(function () {
	"use strict";

	/**
	 * @exports chatClient-response
	 */
	module.exports = {};

	/**
	 * @method login/authenticate
	 *
	 * @desc Response to the `authenticate` event.
	 *
	 * @param {String} message - on error
	 * @param {ObjectId} user
	 */
	module.exports.authenticate = function () {};

	/**
	 * @method create
	 *
	 * @desc Response to the creation of a chat.
	 *
	 * @param {String} message
	 * @param {Object} data - chat object
	 */
	module.exports.create = function () {};

	/**
	 * @method join
	 *
	 * @desc Receive all members on create new chat
	 *
	 * @param {String} message
	 * @param {Object} data - chat json
	 *
	 */
	module.exports.join = function () {};

	/**
	 * @method leave
	 *
	 * @desc Receive all members of chat, when member leaves from chat.
	 *
	 * @param {String} message
	 * @param {Object} data - member
	 * @param {ObjectId} chatId
	 *
	 */
	module.exports.leave = function () {};

	/**
	 * @method newSystemMessage
	 *
	 * @desc System messages of chat. On member leave/add/remove, change title.
	 *
	 * @param {String} message
	 * @param {Object} data - json message
	 * @param {ObjectId} chatId
	 *
	 */
	module.exports.newSystemMessage = function () {};

	/**
	 * @method addMember
	 *
	 * @desc Receive all members of chat, when member added to chat or chat create.
	 *
	 * @param {String} message
	 * @param {Object} data - member
	 * @param {ObjectId} chatId
	 *
	 */
	module.exports.addMember = function () {};

	/**
	 * @method removeMember
	 *
	 * @param {String} message
	 * @param {Object} data - member
	 * @param {ObjectId} chatId
	 *
	 */
	module.exports.removeMember = function () {};

	/**
	 * @method newMessage
	 *
	 * @desc Receive all members of chat, when member removed from chat.
	 *
	 * @param {String} message
	 * @param {Object} data - json message
	 * @param {ObjectId} chatId
	 *
	 */
	module.exports.newMessage = function () {};

	/**
	 * @method changeTitle
	 *
	 * @desc Receive all members of chat, when member send new message.
	 *
	 * @param {String} message
	 * @param {String} data - new title
	 * @param {ObjectId} chatId
	 *
	 */
	module.exports.changeTitle = function () {};

	/**
	 * @method findMessagesLast
	 *
	 * @desc Response to the `findMessagesLast` event.
	 *
	 * @param {ObjectId} chatId
	 * @param {Object[]} data
	 *
	 */
	module.exports.findMessagesLast = function () {};

	/**
	 * @method findMessagesFrom
	 *
	 * @desc Response to the `findMessagesFrom` event.
	 *
	 * @param {ObjectId} chatId
	 * @param {Object[]} data
	 *
	 */
	module.exports.findMessagesFrom = function () {};

	/**
	 * @method findMessagesAt
	 *
	 * @desc Response to the `findMessagesAt` event.
	 *
	 * @param {ObjectId} chatId
	 * @param {Object[]} data
	 *
	 */
	module.exports.findMessagesAt = function () {};

	/**
	 * @method findChats
	 *
	 * @desc Response to the `findChats` event.
	 *
	 * @param {Object[]} data
	 *
	 */
	module.exports.findChats = function () {};

	/**
	 * @method findChat
	 *
	 * @desc Response to the `findChat` event.
	 *
	 * @param {Object[]} data
	 *
	 */
	module.exports.findChat = function () {};

}());