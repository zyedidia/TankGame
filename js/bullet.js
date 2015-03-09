Bullet = function(img, world, startx, starty, startAngle, startSpeed) {
	this.init(img);

	this.width = 0.05; this.height = 0.05;
	this.torque = 0;

	this.speed = startSpeed;
	this.createBody(world, startx, starty);
	this.createShape();

	this.body.SetAngle(startAngle * toRadians);
	this.body.SetUserData("Bullet");
	// this.body.SetLinearDamping(10);
	this.body.SetBullet(true);

	var vx = this.speed * Math.cos(this.body.GetAngle() - Math.PI / 2);
	var vy = this.speed * Math.sin(this.body.GetAngle() - Math.PI / 2);

	var velocity = new b2Vec2(vx, vy);

	this.body.ApplyImpulse(velocity, this.body.GetPosition());
}

Bullet.prototype = new Sprite();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function(dt) {
	Sprite.prototype.update.call(this, dt);
	this.checkCollision();
}

Bullet.prototype.createShape = function() {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.0;
	fixDef.restitution = 1.0;

	fixDef.shape = new b2CircleShape;
	fixDef.shape.SetRadius(this.width);
	this.body.CreateFixture(fixDef);
}

Bullet.prototype.checkCollision = function() {
	for (var ce = this.body.GetContactList(); ce != null; ce = ce.next) {
		if (ce.contact.IsTouching()) {
			console.log("Collision");
		}
	}
}
