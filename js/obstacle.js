Obstacle = function(img, world, x, y, angle, width, height) {
	this.init(img);
	this.width = width;
	this.height = height;

	this.createBody(world, x, y);
	this.createShape();

	this.body.SetAngle(angle * toRadians);

	this.body.SetLinearDamping(10);
	this.body.SetUserData("Obstacle");
}

Obstacle.prototype = new Sprite();
Obstacle.prototype.constructor = Obstacle;
