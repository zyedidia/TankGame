var world;

var keysDown = {};

tanks = [];
sprites = [];
markedToDestroy = [];

var team = 0;

var ids = [];

var updateTime = 1000 / 80;
var lastTime = 0;
var then = 0;

var w = 850;
var h = 600;

function setupWorld() {
	world = new b2World(new b2Vec2(0, 0), true);

	// Add obstacles here
	addObstacle(20, 15, 10, 2, 2);
}

function tick() {
	var now = Date.now();
	var delta = now - then;
	if (delta > updateTime) {
		update(delta);
		then = now - (delta % updateTime);
	}
}

function update(dt) {
	world.Step(1 / 80, 10, 10);

	if (tanks.length == ids.length) {
		for (i in ids) {
			var tank = tankWithID(ids[i]);
			tank.handleKeys(keysDown[ids[i]]);
			tank.updatePosition(dt);
		}
	}

	var data = [];
	for (i in tanks) {
		var tank = tanks[i];
		data[i] = {pos: tank.body.GetPosition(), angle: tank.body.GetAngle(), linearVelocity: tank.body.GetLinearVelocity(), angularVelocity: tank.body.GetAngularVelocity(), id: tank.id};
	}
	io.sockets.emit('tanks', data);
	data = [];
	for (i in sprites) {
		sprites[i].update();
		var sprite = sprites[i];
		data[i] = {pos: sprite.body.GetPosition(), angle: sprite.body.GetAngle()};
	}
	io.sockets.emit('sprites', data);

	collectGarbage();
}

function collectGarbage() {
	for (i in markedToDestroy) {
		world.DestroyBody(markedToDestroy[i].body);
		console.log("Destroyed 1 body");
		index = sprites.indexOf(markedToDestroy[i]);
		if (index > -1) {
			sprites.splice(index, 1);
			console.log("Destroyed 1 sprite");
		}
		index = tanks.indexOf(markedToDestroy[i]);
		if (index > -1) {
			tanks.splice(index, 1);
			console.log("Destroyed 1 tank");
		}
	}
	markedToDestroy = [];
}

function addObstacle(x, y, angle, width, height) {
	var obstacle = new Obstacle("", world, x, y, angle, width, height);
	io.sockets.emit('newobstacle', {pos: new b2Vec2(x, y), angle: angle, width: width, height: height});
	console.log("Sent message");
	sprites.push(obstacle);
}

function addBullet(x, y, angle, speed) {
	var bullet = new Bullet("", world, x, y, angle, speed);
	io.sockets.emit('newbullet', {pos: new b2Vec2(x, y), angle:angle, speed: speed});
	sprites.push(bullet);
}

function addTank(x, y, angle, team, id) {
	var tank = new Tank(team, world, x, y, angle, id, true);
	io.sockets.emit('newtank', {pos: new b2Vec2(x, y), angle: angle, team: team, id: id});
	console.log("Creating new tank with id " + id);
	game.ids.push(id);
	tanks.push(tank);
}

function newConnection(socket) {
	for (i in tanks) {
		socket.emit('newtank', {pos: tanks[i].body.GetPosition(), angle: tanks[i].body.GetAngle(), team: tanks[i].team, id: tanks[i].id});
	}
	for (i in sprites) {
		if (sprites[i] instanceof Obstacle) {
			socket.emit('newobstacle', {pos: sprites[i].body.GetPosition(), angle: sprites[i].body.GetAngle(), width: sprites[i].width, height: sprites[i].height});
		} else if (sprites[i] instanceof Bullet) {
			socket.emit('newbullet', {pos: sprites[i].body.GetPosition(), angle: sprites[i].body.GetAngle(), speed: sprites[i].speed});
		} else {
			console.log("unknown sprite: " + typeof sprites[i]);
		}
	}
	addTank(9, 15, 0, team, socket.id);
	team = 1;
}

function tankWithID(id) {
	for (i in tanks) {
		if (tanks[i].id === id) {
			return tanks[i];
		}
	}
	return null;
}

module.exports.world = world;
module.exports.keysDown = keysDown;
module.exports.ids = ids;

module.exports.tanks = tanks;
module.exports.sprites = sprites;
module.exports.markedToDestroy = markedToDestroy;

module.exports.updateTime = updateTime;
module.exports.lastTime = lastTime;

module.exports.setupWorld = setupWorld;
module.exports.tick = tick;
module.exports.update = update;
module.exports.collectGarbage = collectGarbage;
module.exports.addObstacle = addObstacle;
module.exports.addBullet = addBullet;
module.exports.addTank = addTank;
module.exports.tankWithID = tankWithID;
module.exports.newConnection = newConnection;
