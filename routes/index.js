var assert = require('assert');
var express = require('express');
    router = express.Router();
    app = express();

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('main.pug');
});

app.get('/home',function (req,res) {
    res.render('home.pug');
});

app.get('/home/pref',function (req,res) {
    res.render('prefs.pug');
});

app.get('/home/join',function (req,res) {
    res.render('join.pug');
});

app.get('/home/create',function (req,res) {
    res.render('create.pug');
});

app.get('/home/myEvents',function (req,res) {
    res.render('myEvents.pug');
});

module.exports = function(io) {
    var app = require('express');
    var router = app.Router();
/*
    io.on('connection', function(socket) {
        //console.log( "A user connected" );
        socket.on('disconnect', function() {
            console.log('index disconnected');
        });
        socket.on('chat message',function(data){
            console.log('message: ' + data.message);
            //console.log("message received");
            //io.sockets.emit('chat',data);
        });

        // Handle typing event
        socket.on('typing', function(data) {
            socket.broadcast.emit('typing', data);
        });
    });
*/

    return router;
};

module.exports = app;
