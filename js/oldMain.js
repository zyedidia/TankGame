var world;
var keysDown = [];

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width(); // Width
var h = $("#canvas").height(); // Height

var images = [];
var sprites = [];
var tanks = [];
var markedToDestroy = [];
var updateTime = 1000 / 80;

var lastTime = 0;

var myID;

var socket = io();

socket.on('disconnection', function(id) {
	tankWithID(id).destroy();
});

socket.on('id', function(id) {
	console.log("Received id " + id);
	myID = id;
});

socket.on('newtank', function(data) {
	console.log("New tank with id " + data.id);
	console.log(data.id + " == " + myID + " -> " + (data.id === myID));
	addTank(data.pos.x, data.pos.y, data.angle, data.team, data.id, data.id === myID);
});

socket.on('newbullet', function(data) {
	addBullet(data.pos.x, data.pos.y, data.angle, data.speed);
});

socket.on('newobstacle', function(data) {
	console.log("adding obstacle")
	addObstacle(data.pos.x, data.pos.y, data.angle, data.width, data.height);
});

socket.on('tanks', function(data) {
	for (i in data) {
		if (tanks.length > 0) {
			var tank = tankWithID(data[i].id);
			tank.body.SetPositionAndAngle(data[i].pos, data[i].angle);
			tank.body.SetLinearVelocity(data[i].linearVelocity);
			tank.body.SetAngularVelocity(data[i].angularVelocity);
		}
	}
});

socket.on('sprites', function(data) {
	if (sprites.length == data.length) {
		for (i in data) {
			sprites[i].body.SetPositionAndAngle(data[i].pos, data[i].angle);
		}
	} else {
		console.log("Something is not right");
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
		update(delta / 10);
		render();
		lastTime = now - (delta % updateTime);
	}

	window.requestAnimationFrame(run);
}

function update(deltaTime) {
	world.Step(1 / 80, 10, 10);

	for (i in tanks) {
		tanks[i].handleKeys(keysDown);
		tanks[i].updatePosition(deltaTime);
		tanks[i].update(deltaTime);
	}

	for (i in markedToDestroy) {
		world.DestroyBody(markedToDestroy[i].body);
		var index = sprites.indexOf(markedToDestroy[i]);
		if (index > -1) {
			sprites.splice(index, 1);
		}
		index = tanks.indexOf(markedToDestroy[i]);
		if (index > -1) {
			tanks.splice(index, 1);
		}
	}
	markedToDestroy = [];
}

function render() {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);

	world.DrawDebugData();
	world.ClearForces();

	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, w, h);

	for (i in sprites) {
		sprites[i].draw();
	}
	for (i in tanks) {
		tanks[i].draw();
	}
}

function addBullet(x, y, angle, speed) {
	var image = new CanvasImage(images[0], ctx);
	image.isCircle = true;
	var bullet = new Bullet(image, world, x, y, angle, speed);
	sprites.push(bullet);
}

function addObstacle(x, y, angle, width, height) {
	var image = new CanvasImage(images[2], ctx);
	var obstacle = new Obstacle(image, world, x, y, angle, width, height);
	sprites.push(obstacle);
}

function addTank(x, y, angle, team, id, mainTank) {
	var image = new CanvasImage(images[team], ctx);
	var tank = new Tank(image, world, x, y, angle, id, mainTank);
	console.log("Adding tank with id " + id);
	tanks.push(tank);
}

function removeTankWithID(id) {
	for (i in tanks) {
		if (tanks[i].id === id) {
			tanks[i].destroy();
		}
	}
}

function tankWithID(id) {
	for (i in tanks) {
		if (tanks[i].id === id) {
			return tanks[i];
		}
	}
	return null;
}

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
