Tank = function(img, startx, starty) {
	this.accel = 5;
	this.maxSpeed = 10; this.rotateSpeed = 2;

	this.shotCooldown = 0.5; this.lastShot = 0;
	this.health = 10; this.ammo = 10;
	this.reloadSpeed = 2.5;
}

Tank.prototype = Object.create(Sprite.prototype);
Tank.prototype.constructor = Tank;
