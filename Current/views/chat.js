//Make connection
var socket = io.connect('https://localhost:4000');

//Query DOM
var message = document.getElementById('message');
    handle = document.getElementById('handle');
    send_button = document.getElementById('send');
    output = document.getElementById('#chatOutput');

// Emit events

send_button.addEventListener('click', function(){
   socket.emit('chat', {
       message: message.value,
       handle: handle.value
   }) ;
});

//Listen for events
socket.on('chat',function(data){
    output.innerHTML += '<p><strong>'+ data.handle + ': </strong>' + data.message + '</p>'
});