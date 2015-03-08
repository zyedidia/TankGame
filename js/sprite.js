Sprite = function(img, world, startx, starty) {
	this.img = img;

	this.x = startx, this.y = starty;
	this.width = 0.75, this.height = 1;
	this.speed = 5;
	this.torque = 1;

	this.createBody(world, startx, starty);
	this.createShape();
}

Sprite.prototype.createBody = function(world, x, y) {
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position = new b2Vec2(x, y);
	this.body = world.CreateBody(bodyDef);
	this.body.SetAngle(Math.PI / 3);
}

Sprite.prototype.createShape = function() {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(this.width, this.height);
	this.body.CreateFixture(fixDef);
}

Sprite.prototype.draw = function() {
	var toDegrees = 180 / Math.PI;
	this.x = this.body.GetPosition().x; this.y = this.body.GetPosition().y;
	this.angle = this.body.GetAngle() * toDegrees;
	this.img.x = this.x * scale; this.img.y = this.y * scale;
	this.img.width = this.width * scale * 2.75; this.img.height = this.height * scale * 2;
	this.img.angle = this.angle;

	this.img.draw();
}

Sprite.prototype.update = function(deltaTime) {
	this.updatePosition(deltaTime);
}

Sprite.prototype.updatePosition = function(deltaTime) {
	toRadians = Math.PI / 180;
	var vx = this.speed * Math.cos((this.angle - 90) * toRadians);
	var vy = this.speed * Math.sin((this.angle - 90) * toRadians);

	// this.angle += 5;
	var x = this.body.GetPosition().x;
	var y = this.body.GetPosition().y;

	this.body.linearVelocity = new b2Vec2(vx, vy);
	// this.body.angularVelocity = this.torque;
}
