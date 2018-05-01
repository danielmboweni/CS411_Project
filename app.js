var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket_io    = require( "socket.io" );

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Socket.io
var io           = socket_io();
app.io           = io;
// socket.io events
io.on('connection', function(socket) {
    console.log( "connected" );
    socket.on('disconnect', function() {
        console.log('disconnected');
    });
    socket.on('chat',function(data){
        //console.log('message: ' + data.message);
        console.log("message received");
        io.sockets.emit('chat',data);
    });

    // Handle typing event
    socket.on('typing', function(data) {
        socket.broadcast.emit('typing', data);
    });
});
module.exports = app;
//var routes = require('./routes/index')(io);

