var world;

// Use keysDown[id] to get a list of keys down for that id
var keysDown = {};

sprites = {};
markedToDestroy = [];

var curID = 0;

var updateTime = 1000 / 80;
var lastTime = 0;

var gameWidth = 50;
var gameHeight = 50;

function setupWorld() {
	world = new b2World(new b2Vec2(0, 0), true);

	// Add obstacles here
	
	var numObstacles = randInt(3, 9);
	for (i = 0; i < numObstacles; i++) {
		addObstacle(randInt(5, gameWidth - 5), randInt(5, gameHeight - 5), randInt(0, 359) * toRadians, randInt(1, 4), randInt(1, 4));
	}
	// addObstacle(5, 7, 0, 2, 2, false);
	// addObstacle(20, 15, 10 * toRadians, 2, 2, false);
	// addObstacle(10, 18, 0, 2, 2, false);

	addObstacle(gameWidth / 2, 0, 0, gameWidth / 2, 0.01, true);
	addObstacle(gameWidth / 2, gameHeight, 0, gameWidth / 2, 0.01, true);
	addObstacle(0, gameHeight / 2, 0, 0.01, gameHeight / 2, true);
	addObstacle(gameWidth, gameHeight / 2, 0, 0.01, gameHeight / 2, true);
}

function tick() {
	var now = Date.now();
	var delta = now - lastTime;
	if (delta > updateTime) {
		update();
		lastTime = now - (delta % updateTime);
	}
}

function update() {
	world.Step(1 / 80, 10, 10);

	for (var id in sprites) {
		var sprite = sprites[id];
		if (sprite instanceof Tank) {
			sprite.handleKeys(keysDown[id]);
			sprite.updatePosition();
		}
		sprite.update();
	}

	collectGarbage();
}

function collectGarbage() {
	for (i in markedToDestroy) {
		world.DestroyBody(markedToDestroy[i].body);
		console.log("Destroyed 1 body");
		delete sprites[markedToDestroy[i].id];
		console.log("Destroyed 1 sprite");
		io.sockets.emit('destroysprite', markedToDestroy[i].id);
	}

	markedToDestroy = [];
}

function addObstacle(x, y, angle, width, height, immovable) {
	curID++;
	var obstacle = new Obstacle("", world, x, y, angle, width, height, curID);
	if (immovable) obstacle.setImmovable();
	io.sockets.emit('newobstacle', {pos: new b2Vec2(x, y), angle: angle, width: width, height: height, immovable: immovable, id: curID});
	sprites[curID] = obstacle;
}

function addBullet(x, y, angle, speed) {
	curID++;
	var bullet = new Bullet("", world, x, y, angle, speed, curID);
	io.sockets.emit('newbullet', {pos: new b2Vec2(x, y), angle:angle, speed: speed, id: curID});
	sprites[curID] = bullet;
}

function addTank(x, y, angle, team, id) {
	var tank = new Tank(team, world, x, y, angle, id, true);
	io.sockets.emit('newtank', {pos: new b2Vec2(x, y), angle: angle, team: team, id: id});
	console.log("Creating new tank with id " + id);
	sprites[id] = tank;
}

function newConnection(socket) {
	for (i in sprites) {
		var s = sprites[i];
		if (s instanceof Tank) {
			socket.emit('newtank', {pos: s.body.GetPosition(), angle: s.body.GetAngle(), team: s.team, id: s.id});
		} else if (s instanceof Obstacle) {
			socket.emit('newobstacle', {pos: s.body.GetPosition(), angle: s.body.GetAngle(), width: s.width, height: s.height, immovable: s.immovable, id: s.id});
		} else if (s instanceof Bullet) {
			socket.emit('newbullet', {pos: s.body.GetPosition(), angle: s.body.GetAngle(), speed: s.speed, id: s.id});
		} else {
			console.log("Unknown sprite: " + (typeof sprites[i]));
		}
	}

	socket.emit('gamedimensions', {width: gameWidth, height: gameHeight});

	addTank(9, 15, 0, 0, socket.id);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.keysDown = keysDown;

module.exports.sprites = sprites;

module.exports.setupWorld = setupWorld;
module.exports.tick = tick;
module.exports.newConnection = newConnection;
module.exports.addBullet = addBullet;
module.exports.addTank = addTank;
module.exports.addObstacle = addObstacle;
