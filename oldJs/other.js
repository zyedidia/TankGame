
var world;

function init() {
	var   b2Vec2 = Box2D.Common.Math.b2Vec2
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

	world = new b2World(
			new b2Vec2(0, 10)    //gravity
			,  true                 //allow sleep
			);

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	var bodyDef = new b2BodyDef;

	//create ground
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = 9;
	bodyDef.position.y = 13;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(10, 0.5);
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	//create some objects
	bodyDef.type = b2Body.b2_dynamicBody;
	for(var i = 0; i < 10; ++i) {
		if(Math.random() > 0.5) {
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox(
					Math.random() + 0.1 //half width
					,  Math.random() + 0.1 //half height
					);
		} else {
			fixDef.shape = new b2CircleShape(
					Math.random() + 0.1 //radius
					);
		}
		bodyDef.position.x = Math.random() * 10;
		bodyDef.position.y = Math.random() * 10;
		world.CreateBody(bodyDef).CreateFixture(fixDef);
	}

	setInterval(update, 16);
}

function update() {
	world.Step(
			1 / 60   //frame-rate
			,  10       //velocity iterations
			,  10       //position iterations
			);
	// console.log("step");
	// world.DrawDebugData();
	world.ClearForces();
}

var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Box2D = require("./box2d.js");

app.use(express.static("."));

app.get('/', function(req, res){
	res.sendFile(__dirname + "/box2d.html");
});

io.on('connection', function(socket) {
	init();

	socket.on('request', function() {
		socket.emit('world', world);
		console.log("Send");
	})
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
