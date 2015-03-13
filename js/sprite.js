// Sprite class
// Holds a physics body and an image for drawing

Sprite = function() { }

Sprite.prototype.init = function(img, id) {
	this.img = img;

	this.id = id;

	this.width = 0.75, this.height = 1;
	this.widthScale = 1; this.heightScale = 1;
	this.speed = 0;
	this.torque = 0;

	this.lastPosition = new b2Vec2(0, 0);
	this.lastAngle = 0;
}

// Create the physics body
// Default body and shape are for a tank
Sprite.prototype.createBody = function(world, x, y) {
	var bodyDef = new b2BodyDef;
	// Dynamic body
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position = new b2Vec2(x, y);
	this.body = world.CreateBody(bodyDef);
}

// Create the shape
Sprite.prototype.createShape = function() {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(this.width, this.height);
	this.body.CreateFixture(fixDef);
}

// Draw the image
Sprite.prototype.draw = function() {
	var x = this.body.GetPosition().x; var y = this.body.GetPosition().y;
	var angle = this.body.GetAngle() * toDegrees;
	this.img.x = x * scale; this.img.y = y * scale;
	this.img.width = this.width * scale * 2 * this.widthScale; this.img.height = this.height * scale * 2 * this.heightScale;
	this.img.angle = angle;

	this.img.draw();
}

Sprite.prototype.update = function() {
	// If this is serverside
	if (typeof io.sockets !== 'undefined') {
		// If the positions or angle has changed
		if (this.hasChanged()) {
			// Send all clients the new position and angle
			this.sendMessage();
		}
	}
}

Sprite.prototype.sendMessage = function() {
	// Send all clients the new position and angle
	var data = {pos: this.body.GetPosition(), angle: this.body.GetAngle(), id: this.id};
	io.sockets.emit('spritechanged', data);
}

// Check if the angle or position of this sprite have changed since the last check
Sprite.prototype.hasChanged = function() {
	if ((this.body.GetPosition().x !== this.lastPosition.x) || (this.body.GetPosition().y !== this.lastPosition.y) || (this.body.GetAngle() !== this.lastAngle)) {
		this.lastPosition = new b2Vec2(this.body.GetPosition().x, this.body.GetPosition().y);
		this.lastAngle = this.body.GetAngle();
		return true;
	}
	return false;
}

// Destroy this sprite
Sprite.prototype.destroy = function() {
	markedToDestroy.push(this);
}

if (typeof module !== 'undefined') module.exports = Sprite;
