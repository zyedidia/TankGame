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

// The tank that this client controls
var mainTank;

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
	maskCanvas = document.createElement('canvas');
	maskCanvas.width = gameWidth * scale;
	maskCanvas.height = gameHeight * scale;

	maskCtx = maskCanvas.getContext('2d');
})

socket.on('newtank', function(data) {
	console.log("New tank with id " + data.id);
	addTank(data.pos.x, data.pos.y, data.angle, data.team, data.id);
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

socket.on('spritechanged', function(data) {
	if (typeof sprites[data.id] !== 'undefined') {
		sprites[data.id].body.SetPositionAndAngle(data.pos, data.angle);
	}
});

// When a key is pressed, add it to keysDown and send the new array to the server
addEventListener("keydown", function (e) {
	keysDown[e.keyCode || e.which] = true;
	socket.emit('input', keysDown);
}, false);

// When a key is released, remove it from keysDown and send the new array to the server
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode || e.which];
	socket.emit('input', keysDown);
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

function start() {
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
	for (i in markedToDestroy) {
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

	var points = [];
	var obstacles = [];

	for (var id in sprites) {
		var s = sprites[id];
		// ctx.beginPath();
		// ctx.moveTo(s.body.GetPosition().x * scale, s.body.GetPosition().y * scale);
		// ctx.lineTo(points[0].x * scale, points[0].y * scale);
		// ctx.stroke();
		// ctx.fillRect(points[0].x * scale, points[0].y * scale, 5, 5);
		// for (i in points) {
		// 	if (i > 0) {
		// 		ctx.fillStyle = "blue";
		// 		ctx.beginPath();
		// 		ctx.moveTo(s.body.GetPosition().x * scale, s.body.GetPosition().y * scale);
		// 		ctx.lineTo(points[i].x * scale, points[i].y * scale);
		// 		ctx.stroke();
		// 		ctx.fillRect(points[i].x * scale, points[i].y * scale, 5, 5);
		// 		ctx.lineTo(points[i].x * scale, points[i].y * scale);
		// 	}
		// }
		
		// Draw all sprites except the obstacles (obstacles will be drawn afterward
		// So that they are drawn on top of the line of sight
		if (s instanceof Obstacle) {
			obstacles.push(s);
		} else {
			s.draw();
		}
	}

	// Draw all the explosions
	for (i in explosions) {
		explosions[i].draw();
	}

	// If the mainTank is not null
	if (mainTank) {
		// Get the points for line of sight from it
		points = mainTank.lineOfSight(obstacles);
	}

	// This is where the line of sight is drawn from the points given by the tank
	if (points.length > 0) {
		// Draw a big light gray rectangle over everything
		// Draw this in the mask canvas
		maskCtx.fillStyle = "lightgray";
		maskCtx.fillRect(0, 0, gameWidth * scale, gameHeight * scale);

		maskCtx.save();

		// This will clip the next drawn shape out of the big rectangle
		maskCtx.globalCompositeOperation = 'xor';

		// Draw the line of sight
		// This is drawing a polygon over everything that the tank CAN see
		// This clips that shape (everything that the tank can see) out of the big rectangle
		// Leaving you with everything the tank can't see covered
		maskCtx.beginPath();
		maskCtx.moveTo(points[0].x * scale, points[0].y * scale);
		for (i = 1; i < points.length; i++) {
			maskCtx.lineTo(points[i].x * scale, points[i].y * scale);
		}
		maskCtx.closePath();
		maskCtx.fill();
		maskCtx.restore();
		// Draw the maskCanvas on the real canvas
		ctx.drawImage(maskCanvas, 0, 0);
	}

	// Now draw all the obstacles over the line of sight (meaning you can always see obstacles)
	for (i in obstacles) {
		obstacles[i].draw();
	}

	// Restore the camera translations made at the beginning
	ctx.restore();
}

function addObstacle(x, y, angle, width, height, immovable, id) {
	var image = new CanvasImage(images[2], ctx);
	var obstacle = new Obstacle(image, world, x, y, angle, width, height, id);
	if (immovable) obstacle.setImmovable();
	sprites[id] = obstacle;
}

function addBullet(x, y, angle, speed, id) {
	var image = new CanvasImage(images[0], ctx);
	image.isCircle = true;
	var bullet = new Bullet(image, world, x, y, angle, speed, id);
	sprites[id] = bullet;
}

function addTank(x, y, angle, team, id) {
	var image = new CanvasImage(images[team], ctx);
	var tank = new Tank(image, world, x, y, angle, id, id === myID);
	if (id === myID) {
		mainTank = tank;
	}
	console.log("Adding tank with id " + id);
	sprites[id] = tank;
}

function addExplosion(x, y) {
	var e = new Explosion(images[3], ctx, x, y, 39, 72);
	console.log("Explosion: " + e);
	explosions.push(e);
}

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
