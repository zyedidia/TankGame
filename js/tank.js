// This is the tank class
// It inherits from Sprite

Tank = function(img, world, startx, starty, angle, id, mainTank) {
	if (typeof angle === 'undefined') angle = 0;
	// Is this tank the tank that the current client controls (always true if this is serverside)
	this.isMainTank = mainTank;
	this.init(img, id);
	this.accel = 1;
	this.maxSpeed = 3; this.rotateSpeed = 2;
	this.width = 0.75, this.height = 1;
	this.widthScale = 1.4;

	this.dead = false;

	this.spawn = new b2Vec2(9, 15);

	this.name = "No name";

	if (img.imgElement) {
		this.team = img.imgElement.src.indexOf("green") > -1 ? 0 : 1;
	}

	this.shotCooldown = 0.5; this.lastShot = 0;
	this.health = 10; this.ammo = 10;
	this.reloadSpeed = 2.5;

	this.createBody(world, startx, starty);
	this.createShape();

	// This physics body is not allowed to sleep
	this.body.SetSleepingAllowed(false);
	this.body.SetUserData("Tank");
	this.body.SetLinearDamping(10);
	this.body.SetAngle(angle);
}

Tank.prototype = new Sprite();
Tank.prototype.constructor = Tank;

Tank.prototype.draw = function() {
	if (!this.dead) {
		// Call the super class draw()
		Sprite.prototype.draw.call(this);

		// Draw the health bar
		var pos = this.body.GetPosition();
		ctx.fillStyle = "lightgreen";
		ctx.fillRect(pos.x * scale - this.width * scale, pos.y * scale - this.height * scale * 1.75, this.health / 10 * this.width * scale * 2, 5);

		ctx.fillStyle = "red";
		ctx.font = "15px Georgia";
		var nameWidth = ctx.measureText(this.name).width;
		ctx.fillText(this.name, pos.x * scale - nameWidth / 2, pos.y * scale);
	}
}

Tank.prototype.update = function() {
	Sprite.prototype.update.call(this);
	this.checkCollision();

	// Make sure this is not serverside
	if (typeof camera !== 'undefined') {
		// If this tank is controlled by the current client, have the camera follow it
		if (this.isMainTank) {
			var pos = this.body.GetPosition();
			camera.x = pos.x; camera.y = pos.y;
		}
	}
}

Tank.prototype.handleKeys = function(keysDown) {
	// If this tank is not controlled by the current client do not use keypresses for it
	if (!this.isMainTank) return;
	if (this.dead) return;
	if (typeof keysDown === 'undefined') {
		keysDown = [];
	} 
	// Up arrow
	var forward = keysDown[38];
	// Down arrow
	var backward = keysDown[40];
	// Right arrow
	var right = keysDown[39];
	// Left arrow
	var left = keysDown[37];
	// Spacebar
	var shoot = keysDown[32];

	if (forward) {
		this.speed += this.accel;
	} if (backward) {
		this.speed -= this.accel;
	}

	if (this.speed > this.maxSpeed) {
		this.speed = this.maxSpeed;
	} else if (this.speed < -this.maxSpeed) {
		this.speed = -this.maxSpeed;
	}

	if (!(forward || backward)) {
		this.speed = 0;
	}

	if (right) {
		this.torque = this.rotateSpeed;
	} if (left) {
		this.torque = -this.rotateSpeed;
	}

	if (!(right || left)) {
		this.torque = 0;
	}

	if (shoot) {
		this.shoot();
	}
}

Tank.prototype.updatePosition = function() {
	var vx = this.speed * Math.cos(this.body.GetAngle() - Math.PI / 2);
	var vy = this.speed * Math.sin(this.body.GetAngle() - Math.PI / 2);

	var velocity = new b2Vec2(vx, vy);
	this.body.ApplyImpulse(velocity, this.body.GetPosition());

	this.body.SetAngularVelocity(this.torque);
}

Tank.prototype.shoot = function() {
	// Only do anything if this is serverside
	// A message will be send to clients telling them to spawn bullets
	if (typeof game !== 'undefined') {
		// Make sure the shot cooldown has ended
		var now = Date.now();
		if (now - this.lastShot > (this.shotCooldown * 1000)) {
			console.log("Pew pew");
			var x = this.body.GetPosition().x;
			var y = this.body.GetPosition().y;
			var angle = this.body.GetAngle();
			// Add a bullet to the world
			game.addBullet(x + 1.5 * Math.cos(angle + Math.PI * 1.5), y + 1.5 * Math.sin(angle + Math.PI * 1.5), angle, 0.25, true);
			this.lastShot = now;
		}
	}
}

Tank.prototype.respawn = function() {
	var filter = new b2FilterData();
	this.body.GetFixtureList().SetFilterData(filter);

	this.dead = false;

	this.health = 10; this.ammo = 10;
	this.body.SetLinearVelocity(new b2Vec2(0, 0));
	this.body.SetAngularVelocity(0);
	this.body.SetPosition(this.spawn);

	io.sockets.emit("respawn", this.id);
}

Tank.prototype.die = function() {
	var filter = new b2FilterData();
	filter.maskBits = 0x0000;
	this.body.GetFixtureList().SetFilterData(filter);
	this.dead = true;

	io.sockets.emit("die", this.id);
}

// Check for any collisions
Tank.prototype.checkCollision = function() {
	// Loop through all contacts
	for (var ce = this.body.GetContactList(); ce != null; ce = ce.next) {
		if (ce.contact.IsTouching()) {
			var userData = ce.contact.GetFixtureA().GetBody().GetUserData();
			var otherUserData = ce.contact.GetFixtureB().GetBody().GetUserData();

			// If the collision was with a bullet
			if (userData === "Bullet" || otherUserData === "Bullet") {
				console.log("Collided with bullet");
				// If this is clientside, play the audio
				if (typeof playAudio !== 'undefined') {
					playAudio("hit");
				}
				// Decrease health
				this.health -= 1;
				console.log("Health: " + this.health);

				if (this.health === 0) {
					// If this is serverside
					if (typeof io.sockets !== 'undefined') {
						// Clients will be sent a message that this tank was destroyed
						// this.destroy();

						this.die();

						// Respawn in 1 second
						var tank = this;
						setTimeout(function() {
							tank.respawn();
						}, 3000);
					}
				}
			}
		}
	}
}

// Return a list of points showing the line of sight
Tank.prototype.lineOfSight = function(obstacles) {
	var points = [];
	var pointsToTest = [];
	// The four corners
	var corners = [new b2Vec2(0, 0), new b2Vec2(0, gameHeight), new b2Vec2(gameWidth, 0), new b2Vec2(gameWidth, gameHeight)];
	for (i in obstacles) {
		var s = obstacles[i];

		// If this isn't one of the four outer walls then add its vertices to the points to test
		if (!s.immovable) {
			var vertices = s.body.GetFixtureList().GetShape().GetVertices();
			for (i in vertices) {
				// Don't actually add the vertex itself
				// Instead cast a ray slightly above and slightly below the vertex
				var vertex = s.body.GetWorldPoint(vertices[i]);
				var pos = this.body.GetPosition();
				var angle = Math.atan2(pos.y - vertex.y, pos.x - vertex.x);
				var upVertex = new b2Vec2(pos.x - Math.cos(angle + 0.0001), pos.y - Math.sin(angle + 0.0001));
				pointsToTest.push(upVertex);
				var downVertex = new b2Vec2(pos.x - Math.cos(angle - 0.0001), pos.y - Math.sin(angle - 0.0001));
				pointsToTest.push(downVertex);
			}
		}
	}

	// Add the corners
	for (i in corners) {
		pointsToTest.push(corners[i]);
	}

	// Sort the points clockwise
	var pos = this.body.GetPosition();
	pointsToTest.sort(function (a, b) {
		var angleA = Math.atan2(pos.y - a.y, pos.x - a.x);
		var angleB = Math.atan2(pos.y - b.y, pos.x - b.x);
		return angleA - angleB;
	});

	for (i in pointsToTest) {
		var input = new b2RayCastInput();
		input.p1 = this.body.GetPosition();
		input.p2 = pointsToTest[i];

		input.maxFraction = 1000;

		var output = new b2RayCastOutput();

		// Cast each ray and add the intersection points
		var intersectionPoint = raycast(output, input, obstacles);
		points.push(intersectionPoint);
	}

	return points;
}

if (typeof module !== 'undefined') module.exports = Tank;
