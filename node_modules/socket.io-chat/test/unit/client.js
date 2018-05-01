(function () {
	'use strict';

	var should      = require('should'),
	    mongodb     = require('mongodb'),
	    MongoClient = mongodb.MongoClient,
	    connect,
	    db          = require('../../lib/db'),
	    Chat        = require('../../index'),
	    http        = require('http'),
	    faker       = require('faker'),
	    server,
	    prefixName  = 'testName-',
	    debug       = require('debug')('test');

	describe('Client', function () {
		beforeEach(function (done) {
			server && server.close();
			server = null;
			server = http.createServer().listen(4789, '127.0.0.1');
			done();
		});

		before(function (done) {
			MongoClient.connect('mongodb://127.0.0.1/test', function (error, mongoConnect) {
				if (error) {
					throw error;
				}

				connect = mongoConnect;
				Chat.setConnect(mongoConnect);

				connect.collection('chats').remove({ name: new RegExp(prefixName) }, function () {
					done();
				});
			});
		});

		describe('create', function () {
			it('without server', function () {
				should.throws(function () {
					var client = new Chat.Client();
				});
			});

			it('create with server', function () {
				should.doesNotThrow(function () {
					var client = new Chat.Client(server);
				});
			});

			describe('create with options', function () {
				it('event prefix', function () {
					var client;

					should.doesNotThrow(function () {
						client = new Chat.Client(server, {
							eventPrefix: 'testPrefix-'
						});
					});

					client.eventNames.should.matchEach(/testPrefix\-/);
				});

				it('custom events', function () {
					var client;

					should.doesNotThrow(function () {
						client = new Chat.Client(server, {
							EVENTS: {
								ADDMEMBER: 'myAddMember',
								testEv:    123
							}
						});
					});

					client.eventNames.ADDMEMBER.should.equal('myAddMember');
					should(client.eventNames.testEv).not.ok;
				});

				it('collection name chat', function () {
					var client;

					should.doesNotThrow(function () {
						client = new Chat.Client(server, {
							collectionChat: 'myChat'
						});
					});

					var chatModel = new (client.model('chat'))();

					chatModel.collection().should.equal('myChat');
				});

				it('collection name message', function () {
					var client;

					should.doesNotThrow(function () {
						client = new Chat.Client(server, {
							collectionMessage: 'myMessage'
						});
					});

					var messageModel = new (client.model('message'))();

					messageModel.collection().should.equal('myMessage');
				});
			});
		});

		describe('create chat', function () {
			var client;

			beforeEach(function (done) {
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				done();
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('fail, not specify name', function (done) {
				var user = new db.ObjectID();

				client.create({}, user)
					.then(done, function (error) {
						should(error).ok;
						error.should.instanceof(Error);
						error.message.should.match(/name/);
						done();
					})
					.catch(done);
			});

			it('fail, not specify creator', function (done) {
				var user = new db.ObjectID();

				client.create({ name: prefixName + 'some chat' })
					.then(done, function (error) {
						should(error).ok;
						error.should.instanceof(Error);
						error.message.should.match(/creatorId/);
						done();
					})
					.catch(done);
			});

			it('success', function (done) {
				var user = new db.ObjectID();

				client.create({ name: prefixName + 'some chat' }, user)
					.then(function (chat) {
						should(chat).ok;
						should(chat.get('_id')).ok;

						connect.collection(chat.collection()).findOne({
							_id: chat.get('_id')
						}, function (error, result) {
							if (error) {
								return done(error);
							}

							if (!result) {
								done(new Error('not found new chat'));
							}

							should(result).ok;

							done();
						});

					}, done)
					.catch(done);
			});
		});

		describe('validate path', function () {
			// TODO: enter and leave not checked
			var client;

			beforeEach(function (done) {
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				done();
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('create', function (done) {
				client.validate('create', function () {
					done();
				});

				client.create();
			});

			it('addMember', function (done) {
				var user = new db.ObjectID();

				client.validate('addMember', function () {
					done();
				});

				client.create({ name: prefixName + 'test-chat' }, user)
					.then(function (chat) {
						should(chat).ok;

						client.addMember(chat, new db.ObjectID());

					}, done);
			});

			it('removeMember', function (done) {
				var user = new db.ObjectID();

				client.validate('removeMember', function () {
					done();
				});

				client.create({ name: prefixName + 'test-chat' }, user)
					.then(function (chat) {
						should(chat).ok;

						client.removeMember(chat, new db.ObjectID());

					}, done);
			});

			it('newMessage', function (done) {
				var user = new db.ObjectID();

				client.validate('newMessage', function () {
					done();
				});

				client.create({ name: prefixName + 'test-chat' }, user)
					.then(function (chat) {
						should(chat).ok;

						client.newMessage(chat, { text: 'new message' }, chat.creatorId);

					}, done);
			});

			it('newSystemMessage', function (done) {
				var user = new db.ObjectID();

				client.validate('newSystemMessage', function () {
					done();
				});

				client.create({ name: prefixName + 'test-chat' }, user)
					.then(function (chat) {
						should(chat).ok;

						client.newSystemMessage(chat, { text: 'system message' }, chat.creatorId);

					}, done);
			});

			it('findMessagesLast', function (done) {
				var user = new db.ObjectID();

				client.validate('findMessagesLast', function () {
					done();
				});

				client.create({ name: prefixName + 'test-chat' }, user)
					.then(function (chat) {
						should(chat).ok;

						client.findLastMessages(chat.get('_id'), user, 10);

					}, done);
			});

			it('findMessagesFrom', function (done) {
				var user = new db.ObjectID();

				client.validate('findMessagesFrom', function () {
					done();
				});

				client.create({ name: prefixName + 'test-chat' }, user)
					.then(function (chat) {
						should(chat).ok;

						client.findFromMessages(chat.get('_id'), user, 10);

					}, done);
			});

			it('findAt', function (done) {
				var user = new db.ObjectID();

				client.validate('findMessagesAt', function () {
					done();
				});

				client.create({ name: prefixName + 'test-chat' }, user)
					.then(function (chat) {
						should(chat).ok;

						client.findAtMessages(chat.get('_id'), user, 10);

					}, done);
			});
		});

		// TODO: проверка на смену типа
		describe('add member to chat', function () {
			var client, chat, creator;

			beforeEach(function (done) {
				creator = new db.ObjectID();
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				client.create({ name: prefixName + faker.company.companyName() }, creator)
					.then(function (result) {
						chat = result;

						done();
					}, done);
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('fail, member not specified', function (done) {
				var user         = new db.ObjectID(),
				    lengthBefore = chat.get('members').length,
				    lengthAfter;

				client.addMember(chat, undefined, null, client.FLAGS.OTHER)
					.then(function () {
						lengthAfter = chat.get('members').length;

						should(lengthBefore).equal(lengthAfter);

						connect.collection(chat.collection()).findOne({ _id: chat.get('_id') }, function (error, result) {
							if (error) {
								done(error);
							}

							should(result).ok;
							should(result.members.length).equal(lengthAfter);

							done();
						});
					})
					.catch(done);
			});

			it('fail, member id is not valid ObjectId', function (done) {
				var user         = new db.ObjectID(),
				    lengthBefore = chat.get('members').length,
				    lengthAfter;

				client.addMember(chat, 123, null, client.FLAGS.OTHER)
					.then(function () {
						lengthAfter = chat.get('members').length;

						should(lengthBefore).equal(lengthAfter);

						connect.collection(chat.collection()).findOne({ _id: chat.get('_id') }, function (error, result) {
							if (error) {
								return done(error);
							}

							should(result.members.length).equal(lengthAfter);

							done();
						});
					})
					.catch(done);
			});

			it('success', function (done) {
				var user         = new db.ObjectID(),
				    lengthBefore = chat.get('members').length,
				    lengthAfter;

				client.addMember(chat, user, null, client.FLAGS.OTHER)
					.then(function () {
						lengthAfter = chat.get('members').length;

						should(lengthBefore + 1).equal(lengthAfter);

						connect.collection(chat.collection()).findOne({ _id: chat.get('_id') }, function (error, result) {
							if (error) {
								return done(error);
							}

							should(result.members.length).equal(lengthAfter);

							done();
						});
					})
					.catch(done);
			});
		});

		// TODO: проверка на смену типа
		describe('remove member from chat', function () {
			var client, chat, creator, members = [];

			beforeEach(function (done) {
				creator = new db.ObjectID();
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				client.create({ name: prefixName + faker.company.companyName() }, creator)
					.then(function (result) {
						members = [new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID()];

						chat = result;

						members.forEach(function (member) {
							chat.addMember(member);
						});

						chat.save(function (error, result) {
							if (error) {
								return done(error);
							}

							done();
						});
					}, done);
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('fail, member id not passed', function (done) {
				connect.collection(chat.collection())
					.findOne({ _id: chat.get('_id') }, function (error, beforeResult) {
						if (error) {
							return done(error);
						}

						should(beforeResult).ok;

						client.removeMember(chat, undefined, null, client.FLAGS.OTHER)
							.then(function () {
								should(chat.get('members').length).equal(beforeResult.members.length);

								connect.collection(chat.collection())
									.findOne({ _id: chat.get('_id') }, function (error, afterResult) {
										if (error) {
											return done(error);
										}

										should(beforeResult.members.length).equal(afterResult.members.length);
										done();
									});
							})
							.catch(done);
					});
			});

			it('fail, member id is invalid ObjectId', function (done) {
				connect.collection(chat.collection())
					.findOne({ _id: chat.get('_id') }, function (error, beforeResult) {
						if (error) {
							return done(error);
						}

						should(beforeResult).ok;

						client.removeMember(chat, 'dasdas', null, client.FLAGS.OTHER)
							.then(function () {
								should(chat.get('members').length).equal(beforeResult.members.length);

								connect.collection(chat.collection())
									.findOne({ _id: chat.get('_id') }, function (error, afterResult) {
										if (error) {
											return done(error);
										}

										should(beforeResult.members.length).equal(afterResult.members.length);
										done();
									});
							})
							.catch(done);
					});
			});

			it('success', function (done) {
				connect.collection(chat.collection())
					.findOne({ _id: chat.get('_id') }, function (error, beforeResult) {
						if (error) {
							return done(error);
						}

						should(beforeResult).ok;

						client.removeMember(chat, members[1], null, client.FLAGS.OTHER)
							.then(function () {
								should(chat.get('members').length).equal(beforeResult.members.length - 1);

								connect.collection(chat.collection())
									.findOne({ _id: chat.get('_id') }, function (error, afterResult) {
										if (error) {
											return done(error);
										}

										should(beforeResult.members.length - 1).equal(afterResult.members.length);
										done();
									});
							})
							.catch(done);
					});
			});

			it('success, removed 2 members', function (done) {
				connect.collection(chat.collection())
					.findOne({ _id: chat.get('_id') }, function (error, beforeResult) {
						if (error) {
							return done(error);
						}

						should(beforeResult).ok;
						client.removeMember(chat, members[1], null, client.FLAGS.OTHER)
							.then(function () {
								return client.removeMember(chat, members[2], null, client.FLAGS.OTHER);
							})
							.then(function () {
								should(chat.get('members').length).equal(beforeResult.members.length - 2);

								connect.collection(chat.collection())
									.findOne({ _id: chat.get('_id') }, function (error, afterResult) {
										if (error) {
											return done(error);
										}

										should(beforeResult.members.length - 2).equal(afterResult.members.length);
										done();
									});
							})
							.catch(done);
					});
			});

			it('fail, member is creator', function (done) {
				connect.collection(chat.collection())
					.findOne({ _id: chat.get('_id') }, function (error, beforeResult) {
						if (error) {
							return done(error);
						}

						should(beforeResult).ok;
						should(chat.get('creatorId')).ok;

						client.removeMember(chat, chat.get('creatorId'), null, client.FLAGS.OTHER)
							.then(function () {
								should(chat.get('members').length).equal(beforeResult.members.length);

								connect.collection(chat.collection())
									.findOne({ _id: chat.get('_id') }, function (error, afterResult) {
										if (error) {
											return done(error);
										}

										should(beforeResult.members.length).equal(afterResult.members.length);
										done();
									});
							})
							.catch(done);
					});
			});
		});

		describe('new message', function () {
			var client, chat, creator, members = [];

			beforeEach(function (done) {
				creator = new db.ObjectID();
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				client.create({ name: prefixName + faker.company.companyName() }, creator)
					.then(function (result) {
						members = [new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID()];

						chat = result;

						members.forEach(function (member) {
							chat.addMember(member);
						});

						chat.save(function (error, result) {
							if (error) {
								return done(error);
							}

							done();
						});
					})
					.catch(done);
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('fail, author not specified', function (done) {
				connect.collection('messages').count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					client.newMessage(chat, { text: '12312' })
						.then(done, function (error) {
							should(error).ok;
							error.should.instanceof(Error);
							error.message.should.match(new RegExp('Performer not member'));

							connect.collection('messages').count({}, function (error, countAfter) {
								should(countBefore).equal(countAfter);

								done();
							});
						})
						.catch(done);
				});

			});

			it('fail, text not specified', function (done) {
				connect.collection('messages').count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					client.newMessage(chat, {}, chat.get('members')[0])
						.then(done, function (error) {
							should(error).ok;
							error.should.instanceof(Error);
							error.message.should.match(new RegExp('text does not meet minimum length'));

							connect.collection('messages').count({}, function (error, countAfter) {
								should(countBefore).equal(countAfter);

								done();
							});
						})
						.catch(done);
				});

			});

			it('success', function (done) {
				var m = new (client.model('message'))();

				connect.collection(m.collection()).count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					client.newMessage(chat, { text: 'some text' }, chat.get('members')[0])
						.then(function (message) {
							should(message).ok;
							should(message.chatId.equals(chat.get('_id'))).ok
							should(message.authorId.equals(chat.get('members')[0])).ok;
							should(message.type).equal('user');

							should.deepEqual(message.receivers, chat.get('members'));

							connect.collection(m.collection()).count({}, function (error, countAfter) {
								should(countBefore + 1).equal(countAfter);

								done();
							});
						}, done)
						.catch(done);
				});
			});

			it('fail, author not in chat members', function (done) {
				var m = new (client.model('message'))();

				connect.collection(m.collection()).count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					client.newMessage(chat, { text: 'some text' }, new db.ObjectID())
						.then(done, function (error) {
							should(error).ok;
							should(error).instanceof(Error);

							error.message.should.equal('Performer not member');

							connect.collection(m.collection()).count({}, function (error, countAfter) {
								should(countBefore).equal(countAfter);

								done();
							});
						})
						.catch(done);
				});
			});

			it('succes, author not in chat members (set flag)', function (done) {
				var m = new (client.model('message'))();

				connect.collection(m.collection()).count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					var author = new db.ObjectID();

					client.newMessage(chat, { text: 'some text' }, author, client.FLAGS.OTHER)
						.then(function (message) {
							should(message).ok;
							should(message.chatId.equals(chat.get('_id'))).ok
							should(message.authorId.equals(author)).ok;

							should.deepEqual(message.receivers, chat.get('members'));

							connect.collection(m.collection()).count({}, function (error, countAfter) {
								should(countBefore + 1).equal(countAfter);

								done();
							});
						}, done)
						.catch(done);
				});
			});
		});

		describe('new system message', function () {
			var client, chat, creator, members = [];

			beforeEach(function (done) {
				creator = new db.ObjectID();
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				client.create({ name: prefixName + faker.company.companyName() }, creator)
					.then(function (result) {
						members = [new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID()];

						chat = result;

						members.forEach(function (member) {
							chat.addMember(member);
						});

						chat.save(function (error, result) {
							if (error) {
								return done(error);
							}

							done();
						});
					})
					.catch(done);
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('success, add member', function (done) {
				var m       = new (client.model('message'))();
				var newUser = new db.ObjectID();

				connect.collection(m.collection()).count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					client.newSystemMessage(chat, {
						whoAdded:  chat.creatorId,
						whomAdded: newUser
					}, chat.get('members')[0])
						.then(function (message) {
							should(message).ok;
							should(message.chatId.equals(chat.get('_id'))).ok
							should(message.type).equal('system');

							should.deepEqual(message.authorId, db.ObjectID("000000000000000000000000"));
							should.deepEqual(message.receivers, chat.get('members'));
							should.deepEqual(message.system, { whoAdded: chat.creatorId, whomAdded: newUser });

							connect.collection(m.collection()).count({}, function (error, countAfter) {
								should(countBefore + 1).equal(countAfter);

								done();
							});
						}, done)
						.catch(done);
				});
			});

			it('success, remove member', function (done) {
				var m       = new (client.model('message'))();
				var newUser = new db.ObjectID();

				connect.collection(m.collection()).count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					client.newSystemMessage(chat, {
						whoRemove:  chat.creatorId,
						whomRemove: newUser
					}, chat.get('members')[0])
						.then(function (message) {
							should(message).ok;
							should(message.chatId.equals(chat.get('_id'))).ok
							should(message.type).equal('system');

							should.deepEqual(message.authorId, db.ObjectID("000000000000000000000000"));
							should.deepEqual(message.receivers, chat.get('members'));
							should.deepEqual(message.system, { whoRemove: chat.creatorId, whomRemove: newUser });

							connect.collection(m.collection()).count({}, function (error, countAfter) {
								should(countBefore + 1).equal(countAfter);

								done();
							});
						}, done)
						.catch(done);
				});
			});

			it('success, change title', function (done) {
				var m       = new (client.model('message'))();
				var newUser = new db.ObjectID();

				connect.collection(m.collection()).count({}, function (error, countBefore) {
					if (error) {
						return done(error);
					}

					client.newSystemMessage(chat, { oldTitle: '123', newTitle: '321' }, chat.get('members')[0])
						.then(function (message) {
							should(message).ok;
							should(message.chatId.equals(chat.get('_id'))).ok
							should(message.type).equal('system');

							should.deepEqual(message.authorId, db.ObjectID("000000000000000000000000"));
							should.deepEqual(message.receivers, chat.get('members'));
							should.deepEqual(message.system, { oldTitle: '123', newTitle: '321' });

							connect.collection(m.collection()).count({}, function (error, countAfter) {
								should(countBefore + 1).equal(countAfter);

								done();
							});
						}, done)
						.catch(done);
				});
			});
		});

		describe('change title', function () {
			var client, chat, creator, members = [];

			beforeEach(function (done) {
				creator = new db.ObjectID();
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				client.create({ name: prefixName + faker.company.companyName() }, creator)
					.then(function (result) {
						members = [new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID()];

						chat = result;

						members.forEach(function (member) {
							chat.addMember(member);
						});

						chat.save(function (error, result) {
							if (error) {
								return done(error);
							}

							done();
						});
					})
					.catch(done);
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('fail, not a member', function (done) {
				var c = new (client.model('chat'))();

				connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatBefore) {
					if (error) {
						return done(error);
					}

					client.changeTitle(chat, 'new title', new db.ObjectID())
						.then(done, function (error) {
							should(error).ok
							should(error).instanceof(Error);

							error.message.should.match('Performer not member');

							connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatAfter) {
								if (error) {
									return done(error);
								}

								should.equal(chatBefore.title, chatAfter.title);

								done();
							});
						})
						.catch(done);

				});
			});

			it('success, title empty', function (done) {
				var c     = new (client.model('chat'))();
				var title = '';

				connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatBefore) {
					if (error) {
						return done(error);
					}

					client.changeTitle(chat, title, chatBefore.creatorId)
						.then(function (chat) {
							should(chat).ok;
							should.equal(chat.get('title'), title);

							connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatAfter) {
								if (error) {
									return done(error);
								}

								should.equal(chatAfter.title, title);

								done();
							});
						}, done)
						.catch(done);

				});
			});

			it('success', function (done) {
				var c     = new (client.model('chat'))();
				var title = 'new TitlE';

				connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatBefore) {
					if (error) {
						return done(error);
					}

					client.changeTitle(chat, title, chatBefore.creatorId)
						.then(function (chat) {
							should(chat).ok;
							should.equal(chat.get('title'), title);

							connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatAfter) {
								if (error) {
									return done(error);
								}

								should.equal(chatAfter.title, title);

								done();
							});
						}, done)
						.catch(done);

				});
			});

			it('success, performer = OTHER', function (done) {
				var c     = new (client.model('chat'))();
				var title = 'new TitlE OTHER';

				connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatBefore) {
					if (error) {
						return done(error);
					}

					client.changeTitle(chat, title, new db.ObjectID(), client.FLAGS.OTHER)
						.then(function (chat) {
							should(chat).ok;
							should.equal(chat.get('title'), title);

							connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, chatAfter) {
								if (error) {
									return done(error);
								}

								should.equal(chatAfter.title, title);

								done();
							});
						}, done)
						.catch(done);

				});
			});
		});

		describe('leave', function () {
			var client, chat, creator, members = [];

			beforeEach(function (done) {
				creator = new db.ObjectID();
				should.doesNotThrow(function () {
					client = new Chat.Client(server, {});
				});

				client.create({ name: prefixName + faker.company.companyName() }, creator)
					.then(function (result) {
						members = [new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID(), new db.ObjectID()];

						chat = result;

						members.forEach(function (member) {
							chat.addMember(member);
						});

						chat.save(function (error, result) {
							if (error) {
								return done(error);
							}

							done();
						});
					})
					.catch(done);
			});

			afterEach(function (done) {
				if (client) {
					client.destroy();
				}

				done();
			});

			it('fail, Performer not member', function (done) {
				var c = new (client.model('chat'))();

				connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, beforeChat) {
					if (error) {
						return done(error);
					}

					client.leave(chat, 123)
						.then(done, function (error) {
							should(error).ok;
							error.should.instanceof(Error);
							error.message.should.match(/Performer not member/);
							should(chat.members.length).equal(beforeChat.members.length);

							connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, afterChat) {
								if (error) {
									return done(error);
								}

								should(beforeChat.members.length).equal(afterChat.members.length);

								done();
							});

						})
						.catch(done);
				});

			});

			it('fail, Performer not member (argument not passed)', function (done) {
				var c = new (client.model('chat'))();

				connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, beforeChat) {
					if (error) {
						return done(error);
					}

					client.leave(chat)
						.then(done, function (error) {
							should(error).ok;
							error.should.instanceof(Error);
							error.message.should.match(/Performer not member/);
							should(chat.members.length).equal(beforeChat.members.length);

							connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, afterChat) {
								if (error) {
									return done(error);
								}

								should(beforeChat.members.length).equal(afterChat.members.length);

								done();
							});

						})
						.catch(done);
				});
			});

			it('success', function (done) {
				var c = new (client.model('chat'))();

				connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, beforeChat) {
					if (error) {
						return done(error);
					}

					var removedMember = String(chat.members[1]);

					client.leave(chat, chat.members[1])
						.then(function () {
							should(chat).ok;
							should(chat.members.length).equal(beforeChat.members.length - 1);

							connect.collection(c.collection()).findOne({ _id: chat.get('_id') }, function (error, afterChat) {
								if (error) {
									return done(error);
								}

								should(beforeChat.members.length - 1).equal(afterChat.members.length);

								done();
							});
						}, done)
						.catch(done);
				});
			});
		});
	});
}());