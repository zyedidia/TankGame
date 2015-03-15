var world;

// Use keysDown[id] to get a list of keys down for that id
var keysDown = {};

// Use sprites[id] to get the sprite
sprites = {};
// All sprites in this list will be destroyed after the frame is over
markedToDestroy = [];

var curID = 0;

// Holds how many people are on each team
var teams = [0, 0];

// Try to update at 80 frames per second (gets about 75 in practice)
var updateTime = 1000 / 80;
var lastTime = 0;

// Width and height of the world
var gameWidth = 50;
var gameHeight = 50;

var spawns = [];

// Set up the physics world
function setupWorld() {
	//                               v No gravity
	world = new b2World(new b2Vec2(0, 0), true);

	// Add obstacles here
	var numObstacles = randInt(3, 9);
	for (i = 0; i < numObstacles; i++) {
		addObstacle(randInt(5, gameWidth - 5), randInt(5, gameHeight - 5), randInt(0, 359) * toRadians, randInt(1, 4), randInt(1, 4));
	}

	spawns[0] = new b2Vec2(5, 5);
	spawns[1] = new b2Vec2(gameWidth - 5, gameHeight - 5);

	// The four outer walls
	addObstacle(gameWidth / 2, 0, 0, gameWidth / 2, 0.01, true);
	addObstacle(gameWidth / 2, gameHeight, 0, gameWidth / 2, 0.01, true);
	addObstacle(0, gameHeight / 2, 0, 0.01, gameHeight / 2, true);
	addObstacle(gameWidth, gameHeight / 2, 0, 0.01, gameHeight / 2, true);
}

function tick() {
	var now = Date.now();
	var delta = now - lastTime;
	// Make sure it is not updating faster than 80 fps
	if (delta > updateTime) {
		update();
		lastTime = now - (delta % updateTime);
	}
}

function update() {
	// Update the physics
	world.Step(1 / 80, 10, 10);

	for (var id in sprites) {
		var sprite = sprites[id];
		if (sprite instanceof Tank) {
			// Handle the keys that have been sent by the client with the current id
			sprite.handleKeys(keysDown[id]);
			sprite.updatePosition();
		}
		sprite.update();
	}

	// Destroy all sprites in markedToDestroy
	collectGarbage();
}

function collectGarbage() {
	for (i in markedToDestroy) {
		world.DestroyBody(markedToDestroy[i].body);
		console.log("Destroyed 1 body");
		var s = markedToDestroy[i];
		if (s instanceof Tank) teams[s.team]--;
		delete sprites[s.id];
		console.log("Destroyed 1 sprite");
		// Tell all clients to destroy this sprite too
		io.sockets.emit('destroysprite', s.id);
	}

	markedToDestroy = [];
}

// Add an obstacle to the world
function addObstacle(x, y, angle, width, height, immovable) {
	curID++;
	var obstacle = new Obstacle("", world, x, y, angle, width, height, curID);
	if (immovable) obstacle.setImmovable();
	io.sockets.emit('newobstacle', {pos: new b2Vec2(x, y), angle: angle, width: width, height: height, immovable: immovable, id: curID});
	sprites[curID] = obstacle;
}

// Add a bullet to the world
function addBullet(x, y, angle, speed, isShot) {
	if (typeof isShot === 'undefined') isShot = false;
	curID++;
	var bullet = new Bullet("", world, x, y, angle, speed, curID);
	io.sockets.emit('newbullet', {pos: new b2Vec2(x, y), angle:angle, speed: speed, id: curID, isShot: isShot});
	sprites[curID] = bullet;
}

// Add a tank to the world
function addTank(x, y, angle, team, id) {
	teams[team]++;
	var tank = new Tank("", world, x, y, angle, id, true);
	tank.team = team;
	io.sockets.emit('newtank', {pos: new b2Vec2(x, y), angle: angle, team: team, id: id});
	console.log("Creating new tank with id " + id);
	tank.spawn = spawns[team];
	sprites[id] = tank;
}

// When a new user connects
function newConnection(socket) {
	// Send them all the current sprites
	for (i in sprites) {
		var s = sprites[i];
		if (s instanceof Tank) {
			socket.emit('newtank', {pos: s.body.GetPosition(), angle: s.body.GetAngle(), team: s.team, id: s.id, name: s.name, dead: s.dead, health: s.health});
		} else if (s instanceof Obstacle) {
			socket.emit('newobstacle', {pos: s.body.GetPosition(), angle: s.body.GetAngle(), width: s.width, height: s.height, immovable: s.immovable, id: s.id});
		} else if (s instanceof Bullet) {
			socket.emit('newbullet', {pos: s.body.GetPosition(), angle: s.body.GetAngle(), speed: s.speed, id: s.id});
		} else {
			console.log("Unknown sprite: " + (typeof sprites[i]));
		}
	}

	// Send them the game dimensions
	socket.emit('gamedimensions', {width: gameWidth, height: gameHeight});

	// Put them on a team
	var team = teams[0] > teams[1] ? 1 : 0;
	var spawn = spawns[team]
	// Tell all clients to make a new tank (including the new user)
	addTank(spawn.x, spawn.y, 0, team, socket.id);
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Export variables needed in server.js
module.exports.keysDown = keysDown;

module.exports.sprites = sprites;
module.exports.teams = teams;

module.exports.setupWorld = setupWorld;
module.exports.tick = tick;
module.exports.newConnection = newConnection;
module.exports.addBullet = addBullet;
module.exports.addTank = addTank;
module.exports.addObstacle = addObstacle;
