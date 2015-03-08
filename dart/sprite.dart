import 'dart:math';
import 'package:box2d/box2d_browser.dart';
import 'image.dart';

class Sprite {
	Image img;
	Body body;
	var speed, torque = 0.0;
	var dimensions;
	var shouldBeDestroyed = false;

	init(Image img, World world, double startx, double starty) {
		this.img = img;

		createBody(world, startx, starty);
		createShape();
	}

	void createBody(world, startx, starty) {
		BodyDef bodyDef = new BodyDef();
		bodyDef.type = BodyType.DYNAMIC;
		bodyDef.position.setValues(startx, starty);
		body = world.createBody(bodyDef);
	}

	// Default is a tank
	void createShape() {
		PolygonShape dynamicBox = new PolygonShape();
		dynamicBox.setAsBox(3.5, 5.0);
		dimensions = new Vector2(50.0, 50.0);

		FixtureDef fixtureDef = new FixtureDef();
		fixtureDef.shape = dynamicBox;
		fixtureDef.density = 1.0;
		fixtureDef.friction = 0.0;

		body.createFixture(fixtureDef);
	}

	void update() {
	}

	void draw(viewport) {
		var pos = new Vector2(body.position.x, body.position.y);
		viewport.getWorldToScreen(pos, pos);

		img
			..x = pos.x
			..y = pos.y
			..width = dimensions.x
			..height = dimensions.y
			..angle = -degrees(body.angle);

		img.draw();
	}

	void updatePosition() {
		var vx = speed * cos(radians(degrees(body.angle) - 90));
		var vy = speed * sin(radians(degrees(body.angle) - 90));

		body.linearVelocity = new Vector2(vx * 10, vy * 10);
		body.angularVelocity = torque;

	}

	void destroy() {
		shouldBeDestroyed = true;
	}
}
