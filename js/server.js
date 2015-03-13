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

Sprite = require("./sprite.js");
Tank = require("./tank.js");
Bullet = require("./bullet.js");
Obstacle = require("./obstacle.js");
game = require("./game.js");
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
io = require('socket.io')(http);

game.setupWorld();
setInterval(game.tick, 0);

app.use(express.static("."));

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

io.on('connection', function(socket) {
	console.log("User connected with id: " + socket.id);
	socket.emit('id', socket.id);
	game.newConnection(socket);

	socket.on('input', function(input) {
		game.keysDown[socket.id] = input;
	});

	socket.on('disconnect', function() {
		console.log("Destroyed " + socket.id);
		if (typeof game.sprites[socket.id] !== 'undefined') {
			game.teams[game.sprites[socket.id].team]--;
			game.sprites[socket.id].destroy();
		}
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
