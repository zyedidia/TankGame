Sprite = function() { }

Sprite.prototype.init = function(img) {
	this.img = img;

	this.width = 0.75, this.height = 1;
	this.widthScale = 1; this.heightScale = 1;
	this.speed = 0;
	this.torque = 0;
}

Sprite.prototype.createBody = function(world, x, y) {
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position = new b2Vec2(x, y);
	this.body = world.CreateBody(bodyDef);
}

Sprite.prototype.createShape = function() {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(this.width, this.height);
	this.body.CreateFixture(fixDef);
}

Sprite.prototype.draw = function() {
	var toDegrees = 180 / Math.PI;
	var x = this.body.GetPosition().x; var y = this.body.GetPosition().y;
	var angle = this.body.GetAngle() * toDegrees;
	this.img.x = x * scale; this.img.y = y * scale;
	this.img.width = this.width * scale * 2 * this.widthScale; this.img.height = this.height * scale * 2 * this.heightScale;
	this.img.angle = angle;

	this.img.draw();
}

Sprite.prototype.update = function(deltaTime) {
	this.updatePosition(deltaTime);
}

Sprite.prototype.destroy = function() {
	markedToDestroy.push(this);
}
