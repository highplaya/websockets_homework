var express = require('express');
var socketio = require('socket.io');
var bodyParser = require('body-parser');

var app = express();

var server = app.listen(5000);

var io = socketio.listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var messages = [];
var roomMessage = {};

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/index.html');
});

app.post('/messages', function(req, res){
	var message = req.body;
	messages.push(message);
	res.json(message);
});

io.on('connection', function(socket){

	console.log('client connected');

	socket.on('disconnected', function(){
		console.log('client disconnected');
	});

	socket.on('join room', function(room){
		console.log(room);
		socket.join(room);
		if(!roomMessage[room]){
			roomMessage[room] = [];
		}
		socket.emit('room history', roomMessage[room]);
	})

	socket.on('chat message', function(msg){
		messages.push(msg);
		io.emit('chat message', msg);
	});

	socket.on('room message', function(msg){
		var room = socket.rooms[1];
		roomMessage[room].push(msg);
		io.sockets.to(room).emit('room message', msg);
	});

	socket.emit('chat history', messages);

})