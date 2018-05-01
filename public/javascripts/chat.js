//Make connection
var socket = io.connect('https://localhost:3000');

//Query DOM
var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    send_button = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');

// Emit events

send_button.addEventListener('click', function(){
    socket.emit('chat', {
        message: message.value,
        handle: handle.value
    }) ;
    //output.innerHTML += '<p><strong>' + handle.value+ ': </strong>' + message.value + '</p>';
    message.value = "";
});

message.addEventListener('keypress', function(){
    socket.emit('typing', handle.value);
});

// Listen for events
socket.on('chat', function(data){
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
