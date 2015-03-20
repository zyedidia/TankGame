Obstacle = function(img, world, x, y, angle, width, height, id) {
	this.init(img, id);
	this.width = width;
	this.height = height;

	this.createBody(world, x, y);
	this.createShape();

	this.body.SetAngle(angle);

	this.body.SetLinearDamping(10);
	this.body.SetUserData("Obstacle");
	this.body.SetAngularDamping(10);

	this.immovable = false;
}

Obstacle.prototype = new Sprite();
Obstacle.prototype.constructor = Obstacle;

Obstacle.prototype.setImmovable = function() {
	// Set this to a static body so it won't move
	this.body.SetType(b2Body.b2_staticBody);
	this.immovable = true;
}

if (typeof module !== 'undefined') module.exports = Obstacle;
