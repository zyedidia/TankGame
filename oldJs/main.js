var world;

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width(); // Width
var h = $("#canvas").height(); // Height

var images = [];
var sprites = [];
var physObjs = [];
var markedToDestroy = [];
var updateTime = 1000 / 80;

var lastTime = 0;
var isAuthoritative = false;

var socket = io();
var lastPosition = new b2Vec2(0, 0);

socket.on('authoritative', function() {
	isAuthoritative = true;
	console.log("Authoritative player");
});

socket.on('physicsSend', function(args) {
	for (i in physObjs) {
		physObjs[i].body.SetPositionAndAngle(args[i].pos, args[i].angle);
	}
});

socket.on('newtank', function(args) {
	console.log("Added tank");
	var atStart = false;
	if (sprites.length == 0) {
		atStart = true;
	} else {
		console.log(sprites.length);
	}
	addTank(9, 15, 0, args.team, args.id, atStart);
	if (atStart) {
		startWorld();
	}
});

socket.on('removetank', function(id) {
	console.log("removing");
	removeTankWithID(id);
});

socket.on('shoot', function(args) {
	addBullet(args.pos.x, args.pos.y, args.angle, args.speed);
})

socket.on('setcoords', function(args) {
	var id = args.id;
	var pos = args.pos;

	tankWithID(id).body.SetPosition(pos);
});

socket.on('setangle', function(args) {
	var id = args.id;
	var angle = args.angle;

	tankWithID(id).body.SetAngle(angle);
});

init();

start();

function setupWorld() {
	world = new b2World(new b2Vec2(0, 0), true);

	// addTank(9, 15, 0, 1, 0);

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	var bodyDef = new b2BodyDef;

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

function startWorld() {
	addObstacle(13, 20, 10, 2, 2);
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	var bodyDef = new b2BodyDef;

	//create ground
	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(20, 2);
	bodyDef.position.Set(10, 400 / 30 + 1.8);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	bodyDef.position.Set(10, -1.8);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	fixDef.shape.SetAsBox(2, 14);
	bodyDef.position.Set(-1.8, 26);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	bodyDef.position.Set(21.8, 26);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	// addObstacle(20, 15, 10, 2, 2);
}

function start() {
	window.requestAnimationFrame(run);
}

function run(time) {
	var now = Date.now();
	var delta = now - lastTime;

	if (delta > updateTime) {
		update(delta / 20);
		render();
		lastTime = now - (delta % updateTime);
	}

	window.requestAnimationFrame(run);
}

function update(deltaTime) {
	world.Step(1 / 60, 10, 10);

	if (sprites.length > 0) {
		var tank = sprites[0];
		tank.update(deltaTime);

		if (isAuthoritative) {
			var dataToSend = [];
			for (i in physObjs) {
				dataToSend.push({pos: physObjs[i].body.GetPosition(), angle: physObjs[i].body.GetAngle()});
			}
			socket.emit('physics', dataToSend);
		}

		for (i in markedToDestroy) {
			world.DestroyBody(markedToDestroy[i].body);
			index = sprites.indexOf(markedToDestroy[i]);
			if (index > -1) {
				sprites.splice(index, 1);
			}
		}
		markedToDestroy = [];

		var position = sprites[0].body.GetPosition();
		if ((position.x != lastPosition.x) || (position.y != lastPosition.y)) {
			socket.emit('coords', position);
			lastPosition = new b2Vec2(position.x, position.y);
		}
		var angle = sprites[0].body.GetAngle();
		socket.emit('angle', angle);
	}
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
}

function addBullet(x, y, angle, speed) {
	var image = new CanvasImage(images[0], ctx);
	image.isCircle = true;
	var bullet = new Bullet(image, world, x, y, angle, speed);
	sprites.push(bullet);
	physObjs.push(bullet);

}

function addObstacle(x, y, angle, width, height) {
	var image = new CanvasImage(images[2], ctx);
	var obstacle = new Obstacle(image, world, x, y, angle, width, height);
	sprites.push(obstacle);
	physObjs.push(obstacle);
	console.log(physObjs[0]);
}

function addTank(x, y, angle, team, id, mainTank) {
	var image = new CanvasImage(images[team], ctx);
	var tank = new Tank(image, world, x, y, angle, id, mainTank);
	sprites.push(tank);
}

function removeTankWithID(id) {
	for (i in sprites) {
		if (sprites[i].id === id) {
			sprites[i].destroy();
		}
	}
}

function tankWithID(id) {
	for (i in sprites) {
		if (sprites[i].id === id) {
			console.log("Found tank with id " + id);
			return sprites[i];
		}
	}
	return null;
}

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
