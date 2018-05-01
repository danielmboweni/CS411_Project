## Mongopubsub

Mongopubsub is a pub/sub implementation for Node.js and MongoDB. It utilizes Mongo's capped collections and tailable cursors to notify subscribers of inserted documents that match a given query.

[![NPM](https://img.shields.io/npm/v/mongopubsub.svg?style=flat)](http://npm.im/mongopubsub)
[![Build Status](https://img.shields.io/travis/vladotesanovic/mongopubsub.svg?style=flat)](https://travis-ci.org/vladotesanovic/mongopubsub)

## Example

```javascript
var mongopubsub = require('mongopubsub');

var client = mongopubsub('mongodb://localhost:27017/mongopubsub_example');
var channel = client.channel('test');

client.on('error', console.error);
channel.on('error', console.error);

channel.subscribe('bar', function (message) {
    console.log(message.foo); // => 'bar'
});

channel.subscribe('baz', function (message) {
    console.log(message); // => 'baz'
});

channel.publish('bar', { foo: 'bar' });
channel.publish('baz', 'baz');

```

## Usage

### Create a client

You can pass a Db instance or a URI string. For more information about the URI format visit [http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html](http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html)

```javascript
var mongopubsub = require('mongopubsub');

// Using a URI
var client = mongopubsub('mongodb://localhost:27017/mongopubsub_example', [options]);

// Passing a MongoDB driver `Db` instance directly.
var client = mongopubsub(new Db(...));
```

### Channels

A channel maps one-to-one with a capped collection (Mongopubsub will create these if they do not already exist in the database).  Optionally specify the byte size of the collection and/or the max number of documents in the collection when creating a channel.

**WARNING**: You should not create lots of channels because Mongopubsub will poll from the cursor position.

```javascript
var channel = client.channel('foo', { size: 100000, max: 500 });
```

Options:

 - `size` max size of the collection in bytes, default is 5mb
 - `max` max amount of documents in the collection
 - `retryInterval` time in ms to wait if no docs are found, default is 200ms
 - `recreate` recreate the tailable cursor when an error occurs, default is true


**WARNING**: Don't remove collections with running publishers. It's possible for `mongod` to recreate the collection on the next insert (before Mubsub has the chance to do so).  If this happens the collection will be recreated as a normal, uncapped collection.

### Subscribe

```javascript
var subscription = channel.subscribe([event], callback);
```

Subscriptions register a callback to be called whenever a document matching the specified event is inserted (published) into the collection (channel).  You can omit the event to match all inserted documents. To later unsubscribe a particular callback, call `unsubscribe` on the returned subscription object:

```javascript
subscription.unsubscribe();
```
### Publish

```javascript
channel.publish(event, obj, [callback]);
```

Publishing a document simply inserts the document into the channel's capped collection.  A callback is optional.

### Listen to events

The following events will be emitted:

```javascript
// The given event was published
channel.on('myevent', console.log);

// Any event was published
channel.on('message', console.log);

// Document was inserted
channel.on('document', console.log);

// mongopubsub is ready to receive new documents
channel.on('ready', console.log);

// Connection error
client.on('error', console.log);

// Channel error
channel.on('error', console.log);
```

### Close

```javascript
client.close();
```

Closes the MongoDB connection.

## Install

    npm install mongopubsub

## Tests

    make test

You can optionally specify the MongoDB URI to be used for tests:

    MONGODB_URI=mongodb://localhost:27017/mongopubsub_tests make test

