Tank = function(img, world, startx, starty) {
	this.init(img);
	this.accel = 0.5;
	this.maxSpeed = 5; this.rotateSpeed = 2;
	this.width = 0.75, this.height = 1;
	this.widthScale = 1.4;

	this.shotCooldown = 0.5; this.lastShot = 0;
	this.health = 10; this.ammo = 10;
	this.reloadSpeed = 2.5;

	this.createBody(world, startx, starty);
	this.createShape();

	this.body.SetSleepingAllowed(false);
	this.body.SetUserData("Tank");
	this.body.SetLinearDamping(10);
}

Tank.prototype = new Sprite();
Tank.prototype.constructor = Tank;

Tank.prototype.update = function(dt) {
	this.handleKeys();
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

Tank.prototype.shoot = function() {
	var now = Date.now();
	if (now - this.lastShot > (this.shotCooldown * 1000)) {
		console.log("Pew pew");
		var x = this.body.GetPosition().x;
		var y = this.body.GetPosition().y;
		var angle = this.body.GetAngle();
		addBullet(x + 1.5 * Math.cos(angle + Math.PI * 1.5), y + 1.5 * Math.sin(angle + Math.PI * 1.5), angle * toDegrees, 0.25);
		this.lastShot = now;
	}
}
