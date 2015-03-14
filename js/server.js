// Box2D stuff
Box2D = require("./box2dServer.js");

b2Vec2 = Box2D.Common.Math.b2Vec2
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
;

scale = 20.0;

toRadians = Math.PI / 180;
toDegrees = 180 / Math.PI;

// Load all the files
Sprite = require("./sprite.js");
Tank = require("./tank.js");
Bullet = require("./bullet.js");
Obstacle = require("./obstacle.js");
game = require("./game.js");
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
io = require('socket.io')(http);

// Set up the world and start the main loop
game.setupWorld();
setInterval(game.tick, 0);

// When serving the client index.html, give access to everything in the current directory
app.use(express.static("."));

// When a client connects, serve them with index.html
app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

// New connection
io.on('connection', function(socket) {
	console.log("User connected with id: " + socket.id);
	// Send them their id
	socket.emit('id', socket.id);
	game.newConnection(socket);

	// Receive message called input
	socket.on('input', function(input) {
		// Add it to keysDown
		game.keysDown[socket.id] = input;
	});

	socket.on('name', function(name) {
		game.sprites[socket.id].name = name;
		io.sockets.emit('tankname', {name: name, id: socket.id});
	});

	socket.on('chatmessage', function(msg) {
		socket.broadcast.emit('chatmessage', msg);
	});

	// When this user disconnects
	socket.on('disconnect', function() {
		console.log("Destroyed " + socket.id);
		// If they are not already dead (from being shot in game)
		if (typeof game.sprites[socket.id] !== 'undefined') {
			// Remove them from the world
			game.teams[game.sprites[socket.id].team]--;
			game.sprites[socket.id].destroy();
		}
	});
});

// Listen on port 3000
http.listen(3000, function() {
	console.log('listening on *:3000');
});
