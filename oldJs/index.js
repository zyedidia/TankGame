var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var team = 0;
var tanks = [];

app.use(express.static("."));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	console.log('a user connected');

	if (tanks.length === 0) {
		socket.emit('authoritative');
	}

	io.sockets.emit('newtank', {team: team, id: socket.id});

	for (i in tanks) {
		socket.emit('newtank', tanks[i]);
	}

	tanks.push({team: team, id: socket.id});
	team = team === 0 ? 1 : 0;

	socket.on('shoot', function(args) {
		console.log("Shots fired");
		socket.broadcast.emit('shoot', args);
	});

	socket.on('coords', function(coords) {
		socket.broadcast.emit('setcoords', {pos: coords, id: socket.id});
	});

	socket.on('angle', function(angle) {
		socket.broadcast.emit('setangle', {angle: angle, id: socket.id});
	});

	socket.on('physics', function(array) {
		socket.broadcast.emit('physicsSend', array);
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit('removetank', socket.id);
		var index = tanks.indexOf(tankWithID(socket.id));
		if (index > -1) {
			tanks.splice(index, 1);
		}
		console.log('user disconnected');
	});

	function tankWithID(id) {
		for (i in tanks) {
			if (tanks[i].id === id) {
				console.log("Found tank");
				return tanks[i];
			}
		}
		console.log("Did not find tank");
		return null;
	}
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
