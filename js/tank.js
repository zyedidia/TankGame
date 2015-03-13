Tank = function(img, world, startx, starty, angle, id, mainTank) {
	if (typeof angle === 'undefined') angle = 0;
	this.isMainTank = mainTank;
	this.init(img, id);
	this.accel = 1;
	this.maxSpeed = 3; this.rotateSpeed = 2;
	this.width = 0.75, this.height = 1;
	this.widthScale = 1.4;

	if (typeof img === 'number') {
		this.team = img;
	} else {
		this.team = img.imgElement.src.indexOf("green") > -1 ? 0 : 1;
	}

	this.shotCooldown = 0.5; this.lastShot = 0;
	this.health = 10; this.ammo = 10;
	this.reloadSpeed = 2.5;

	this.createBody(world, startx, starty);
	this.createShape();

	this.body.SetSleepingAllowed(false);
	this.body.SetUserData("Tank");
	this.body.SetLinearDamping(10);
	this.body.SetAngle(angle);
}

Tank.prototype = new Sprite();
Tank.prototype.constructor = Tank;

Tank.prototype.update = function() {
	Sprite.prototype.update.call(this);
	this.checkCollision();
	if (typeof camera !== 'undefined') {
		if (this.isMainTank) {
			var pos = this.body.GetPosition();
			camera.x = pos.x; camera.y = pos.y;
		}
	}
}

Tank.prototype.handleKeys = function(keysDown) {
	if (!this.isMainTank) return;
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

	// this.body.SetLinearVelocity(velocity);
	this.body.ApplyImpulse(velocity, this.body.GetPosition());

	this.body.SetAngularVelocity(this.torque);
}

Tank.prototype.shoot = function() {
	if (typeof game !== 'undefined') {
		var now = Date.now();
		if (now - this.lastShot > (this.shotCooldown * 1000)) {
			console.log("Pew pew");
			var x = this.body.GetPosition().x;
			var y = this.body.GetPosition().y;
			var angle = this.body.GetAngle();
			game.addBullet(x + 1.5 * Math.cos(angle + Math.PI * 1.5), y + 1.5 * Math.sin(angle + Math.PI * 1.5), angle, 0.25, true);
			this.lastShot = now;
		}
	}
}

Tank.prototype.checkCollision = function() {
	for (var ce = this.body.GetContactList(); ce != null; ce = ce.next) {
		if (ce.contact.IsTouching()) {
			var userData = ce.contact.GetFixtureA().GetBody().GetUserData();
			var otherUserData = ce.contact.GetFixtureB().GetBody().GetUserData();

			if (userData === "Bullet" || otherUserData === "Bullet") {
				if (typeof playAudio !== 'undefined') {
					playAudio("hit");
				}
				this.health -= 1;
				console.log("Health: " + this.health);

				if (this.health === 0) {
					if (typeof io.sockets !== 'undefined') {
						this.destroy();
					}
				}
			}
		}
	}
}

Tank.prototype.lineOfSight = function(obstacles) {
	var points = [];
	var pointsToTest = [];
	var corners = [new b2Vec2(0, 0), new b2Vec2(0, gameHeight), new b2Vec2(gameWidth, 0), new b2Vec2(gameWidth, gameHeight)];
	for (i in obstacles) {
		var s = obstacles[i];

		if (!s.immovable) {
			var vertices = s.body.GetFixtureList().GetShape().GetVertices();
			for (i in vertices) {
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

	for (i in corners) {
		pointsToTest.push(corners[i]);
	}

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

		var intersectionPoint = raycast(output, input, obstacles);
		points.push(intersectionPoint);
	}

	return points;
}

if (typeof module !== 'undefined') module.exports = Tank;
