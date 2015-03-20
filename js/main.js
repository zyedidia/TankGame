var world;
var keysDown = [];

// The main canvas to draw the world on
var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width(); // Width
var h = $("#canvas").height(); // Height

// Game width and height
// The actual values will be sent by the server on connection
var gameWidth = w;
var gameHeight = h;

// Store the images
var images = [];
var sprites = {};
var markedToDestroy = [];
var explosions = [];
var scores = [0, 0];

var chat;

var keys = [38, 40, 39, 37, 32];

// The tank that this client controls
var mainTank;

var spawns;

// Try to update at 80 fps
var updateTime = 1000 / 80;
var lastTime = 0;

// This client's id (sent to the client on connection)
var myID;

// The socket used for communication with the server
var socket = io();

// Messages

socket.on('id', function(id) {
	// Message from the server containing this client's id
	console.log("Received id " + id);
	myID = id;
});

// Message containing the real game dimensions
socket.on('gamedimensions', function(dimensions) {
	// Set the real values of gameWidth and gameHeight
	gameWidth = dimensions.width;
	gameHeight = dimensions.height;

	// Create a maskCanvas
	// This will be used to draw the line of sight
	// maskCanvas = document.createElement('canvas');
	// maskCanvas.width = gameWidth * scale;
	// maskCanvas.height = gameHeight * scale;
    //
	// maskCtx = maskCanvas.getContext('2d');
});

socket.on('newtank', function(data) {
	console.log("New tank with id " + data.id);
	addTank(data.pos.x, data.pos.y, data.angle, data.team, data.id, data.name, data.dead, data.health);
});

socket.on('newbullet', function(data) {
	if (data.isShot) playAudio("shoot");
	addBullet(data.pos.x, data.pos.y, data.angle, data.speed, data.id);
});

socket.on('newobstacle', function(data) {
	addObstacle(data.pos.x, data.pos.y, data.angle, data.width, data.height, data.immovable, data.id);
});

socket.on('destroysprite', function(id) {
	markedToDestroy.push(sprites[id]);
});

socket.on('tankname', function(data) {
	sprites[data.id].name = data.name;
});

socket.on('spritechanged', function(data) {
	if (typeof sprites[data.id] !== 'undefined') {
		sprites[data.id].body.SetPositionAndAngle(data.pos, data.angle);
	}
});

socket.on('chatmessage', function(msg) {
	chat.addMessage(msg);
});

socket.on('die', function(id) {
	sprites[id].die();
});

socket.on('respawn', function(id) {
	sprites[id].respawn();
});

socket.on('score', function(serverScores) {
	scores = serverScores;
	console.log(scores);
});

// When a key is pressed, add it to keysDown and send the new array to the server
addEventListener("keydown", function (e) {
	var key = e.keyCode || e.which;
	if (keys.indexOf(key) > -1 && !chat.isFocused) {
		keysDown[key] = true;
		socket.emit('input', keysDown);
	}
}, false);

// When a key is released, remove it from keysDown and send the new array to the server
addEventListener("keyup", function (e) {
	var key = e.keyCode || e.which;
	chat.keyPressed(key);
	if (keys.indexOf(key) > -1) {
		delete keysDown[key];
		socket.emit('input', keysDown);
	}
}, false);

init();
start();

// Set up the physics world
function setupWorld() {
	world = new b2World(new b2Vec2(0, 0), true);

	// Box2D debug drawing
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(scale);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

	world.SetDebugDraw(debugDraw);
}

function init() {
	// Load media
	loadImage("img/greenTank.png");
	loadImage("img/brownTank.png");
	loadImage("img/obstacle.png");
	loadImage("img/explosionSpritesheet.png");
	loadAudio("shoot", "audio/shoot.wav");
	loadAudio("hit", "audio/hit.wav");

	setupWorld();
}

function getName() {
	var name = prompt("Please enter your name", "No name");
	if (name === null || name === "") {
		name = "No name";
	}
	name = name.substring(0, 10);
	return name;
}

function start() {
	var name = getName();
	socket.emit("name", name);

	chat = new Chat(20, h - 50, name);

	// Start the main loop
	window.requestAnimationFrame(run);
}

function run(time) {
	var now = Date.now();
	var delta = now - lastTime;

	// Make sure we are not updating faster than 80 fps
	if (delta > updateTime) {
		update();
		render();
		lastTime = now - (delta % updateTime);
	}

	window.requestAnimationFrame(run);
}

function update() {
	// Update the physics world
	world.Step(1 / 80, 10, 10);

	// Update all sprites
	for (var id in sprites) {
		var s = sprites[id];
		if (s instanceof Tank) {
			s.handleKeys(keysDown);
			s.updatePosition();
		}
		s.update();
	}

	// Remove sprites in markedToDestroy
	collectGarbage();
}

function collectGarbage() {
	for (var i in markedToDestroy) {
		var s = markedToDestroy[i];
		world.DestroyBody(s.body);
		console.log("Destroyed 1 body");
		delete sprites[s.id];
		console.log("Destroyed 1 sprite");
	}

	markedToDestroy = [];
}

function render() {
	// Draw the white background
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);

	ctx.save();
	// Translate everything to look like the camera is moving in the world
	// When actually the world is moving around the camera
	ctx.translate(-camera.x * scale + w / 2, -camera.y * scale + h / 2);

	// Draw the box2D debug data
	world.DrawDebugData();
	world.ClearForces();

	// Draw the black outline on the edge of the world
	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, gameWidth * scale, gameHeight * scale);

	for (var id in sprites) {
		var s = sprites[id];
		s.draw();
	}

	// Draw all the explosions
	for (var i in explosions) {
		explosions[i].draw();
	}

	// Line of sight here (if needed)

	// Restore the camera translations made at the beginning
	ctx.restore();

	ctx.font="20px Arial";
	ctx.fillStyle = "#466432";
	ctx.fillText("Green Team: " + scores[0], 20, 20);

	ctx.fillStyle = "#6E603C";
	var width = ctx.measureText("Brown Team: " + scores[1]).width * 2;
	ctx.fillText("Brown Team: " + scores[1], w - width - 20, 20);

	chat.render();
}

function addObstacle(x, y, angle, width, height, immovable, id) {
	var image = new CanvasImage(images[2]);
	var obstacle = new Obstacle(image, world, x, y, angle, width, height, id);
	if (immovable) obstacle.setImmovable();
	sprites[id] = obstacle;
}

function addBullet(x, y, angle, speed, id) {
	var image = new CanvasImage(images[0]);
	image.isCircle = true;
	var bullet = new Bullet(image, world, x, y, angle, speed, id);
	sprites[id] = bullet;
}

function addTank(x, y, angle, team, id, name, dead, health) {
	var image = new CanvasImage(images[team]);
	var tank = new Tank(image, world, x, y, angle, id, id === myID);
	if (id === myID) mainTank = tank;
	if (typeof name !== 'undefined') {
		tank.name = name; tank.health = health; tank.dead = dead;
	}
	console.log("Adding tank with id " + id);
	sprites[id] = tank;
}

function addExplosion(x, y) {
	var e = new Explosion(images[3], ctx, x, y, 39, 72);
	explosions.push(e);
}

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
