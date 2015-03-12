Tank = function(img, world, startx, starty, angle, id, mainTank) {
	if (typeof angle === 'undefined') angle = 0;
	this.isMainTank = mainTank;
	this.init(img);
	this.accel = 0.5;
	this.maxSpeed = 2; this.rotateSpeed = 2;
	this.width = 0.75, this.height = 1;
	this.widthScale = 1.4;

	this.id = id;

	this.shotCooldown = 0.5; this.lastShot = 0;
	this.health = 10; this.ammo = 10;
	this.reloadSpeed = 2.5;

	this.createBody(world, startx, starty);
	this.createShape();

	this.body.SetSleepingAllowed(false);
	this.body.SetUserData("Tank");
	this.body.SetLinearDamping(10);
	this.body.SetAngle(angle * toRadians);
}

Tank.prototype = new Sprite();
Tank.prototype.constructor = Tank;

Tank.prototype.update = function(dt) {
	if (this.isMainTank) {
		this.handleKeys();
		this.updatePosition(dt);
	}
	Sprite.prototype.update.call(this, dt);
}

Tank.prototype.handleKeys = function() {
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

Tank.prototype.updatePosition = function(dt) {
	var vx = this.speed * Math.cos(this.body.GetAngle() - Math.PI / 2);
	var vy = this.speed * Math.sin(this.body.GetAngle() - Math.PI / 2);

	var velocity = new b2Vec2(vx * dt, vy * dt);
	this.torque *= dt;

	// this.body.SetLinearVelocity(velocity);
	this.body.ApplyImpulse(velocity, this.body.GetPosition());

	this.body.SetAngularVelocity(this.torque);
}

Tank.prototype.shoot = function() {
	var now = Date.now();
	if (now - this.lastShot > (this.shotCooldown * 1000)) {
		console.log("Pew pew");
		var x = this.body.GetPosition().x;
		var y = this.body.GetPosition().y;
		var angle = this.body.GetAngle();
		var b = {pos: new b2Vec2(x + 2 * Math.cos(angle + Math.PI * 1.5), y + 2 * Math.sin(angle + Math.PI * 1.5)), angle: angle * toDegrees, speed: 0.25};
		addBullet(x + 2 * Math.cos(angle + Math.PI * 1.5), y + 2 * Math.sin(angle + Math.PI * 1.5), angle * toDegrees, 0.25);
		this.lastShot = now;
		socket.emit('shoot', b);
	}
}
