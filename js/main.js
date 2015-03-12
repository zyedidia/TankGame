var world;
var keysDown = [];

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width(); // Width
var h = $("#canvas").height(); // Height
var gameWidth = w;
var gameHeight = h;

var maskCanvas = document.createElement('canvas');
maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;
var maskCtx = maskCanvas.getContext('2d');

var images = [];
var sprites = {};
var markedToDestroy = [];

var updateTime = 1000 / 80;
var lastTime = 0;

var myID;

var socket = io();

socket.on('id', function(id) {
	console.log("Received id " + id);
	myID = id;
});

socket.on('gamedimensions', function(dimensions) {
	gameWidth = dimensions.width;
	gameHeight = dimensions.height;
})

socket.on('newtank', function(data) {
	console.log("New tank with id " + data.id);
	addTank(data.pos.x, data.pos.y, data.angle, data.team, data.id);
});

socket.on('newbullet', function(data) {
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
})

addEventListener("keydown", function (e) {
	keysDown[e.keyCode || e.which] = true;
	socket.emit('input', keysDown);
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode || e.which];
	socket.emit('input', keysDown);
}, false);

init();
start();

function setupWorld() {
	world = new b2World(new b2Vec2(0, 0), true);

	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(scale);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

	world.SetDebugDraw(debugDraw);
}

function init() {
	loadImage("img/greenTank.png");
	loadImage("img/brownTank.png");
	loadImage("img/obstacle.png");

	setupWorld();
}

function start() {
	window.requestAnimationFrame(run);
}

function run(time) {
	var now = Date.now();
	var delta = now - lastTime;

	if (delta > updateTime) {
		update();
		render();
		lastTime = now - (delta % updateTime);
	}

	window.requestAnimationFrame(run);
}

function update() {
	world.Step(1 / 80, 10, 10);

	for (var id in sprites) {
		var s = sprites[id];
		if (s instanceof Tank) {
			s.handleKeys(keysDown);
			s.updatePosition();
		}
		s.update();
	}

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
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);

	ctx.save();
	ctx.translate(-camera.x * scale + w / 2, -camera.y * scale + h / 2);

	world.DrawDebugData();
	world.ClearForces();

	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, gameWidth * scale, gameHeight * scale);

	var points = [];
	var obstacles = [];

	for (var id in sprites) {
		var s = sprites[id];
		if (s instanceof Tank) {
			if (s.isMainTank) {
				points = s.lineOfSight(sprites);
				ctx.beginPath();
				ctx.moveTo(s.body.GetPosition().x * scale, s.body.GetPosition().y * scale);
				ctx.lineTo(points[0].x * scale, points[0].y * scale);
				ctx.stroke();
				ctx.fillRect(points[0].x * scale, points[0].y * scale, 5, 5);
				for (i in points) {
					if (i > 0) {
						ctx.fillStyle = "blue";
						ctx.beginPath();
						ctx.moveTo(s.body.GetPosition().x * scale, s.body.GetPosition().y * scale);
						ctx.lineTo(points[i].x * scale, points[i].y * scale);
						ctx.stroke();
						ctx.fillRect(points[i].x * scale, points[i].y * scale, 5, 5);
						ctx.lineTo(points[i].x * scale, points[i].y * scale);
					}
				}
			}
		}
		// if (s instanceof Obstacle) {
		// 	obstacles.push(s);
		// } else {
			s.draw();
		// }
	}

	if (points.length > 0) {
		maskCtx.fillStyle = "gray";
		maskCtx.fillRect(0, 0, w, h);

		maskCtx.save();

		maskCtx.globalCompositeOperation = 'xor';

		maskCtx.beginPath();
		maskCtx.moveTo(points[0].x * scale, points[0].y * scale);
		for (i in points) {
			if (i > 0) {
				maskCtx.lineTo(points[i].x * scale, points[i].y * scale);
			}
		}
		maskCtx.closePath();
		maskCtx.fill();
		maskCtx.restore();
		ctx.drawImage(maskCanvas, 0, 0);
	}

	// for (i in obstacles) {
	// 	obstacles[i].draw();
	// }

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
	console.log("Adding tank with id " + id);
	sprites[id] = tank;
}

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
