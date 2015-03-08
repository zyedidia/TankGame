import 'package:box2d/box2d_browser.dart';
import 'sprite.dart';
import 'dart:math';

class Obstacle extends Sprite {
	var width;
	var height;

	Obstacle(Image img, World world, double x, double y, double angle, this.width, this.height) {
		this.img = img;
		createBody(world, x, y);
		createShape();

		body.setTransform(body.position, angle);

		body.userData = "Wall";
	}

	void createBody(world, startx, starty) {
		BodyDef bodyDef = new BodyDef();
		bodyDef.position.setValues(startx, starty);
		body = world.createBody(bodyDef);
	}

	void createShape() {
		PolygonShape box = new PolygonShape();
		box.setAsBox(width, height);
		FixtureDef mainFixture = new FixtureDef();
		mainFixture.shape = box;
		mainFixture.density = 1.0;
		mainFixture.friction = 0.0;
		mainFixture.userData = "MainFixture";
		body.createFixture(mainFixture);
		dimensions = new Vector2(10.0 * width, 10.0 * height);

		for (int i = 0; i < 4; i++) {
			var pos = new Vector2(cos(radians(i * 90)) * width, sin(radians(i * 90)) * height);
			var w = sin(radians(i * 90)) * height;
			var h = cos(radians(i * 90)) * width;
			var realw = w;
			var realh = h;
			box.setAsEdge(new Vector2(pos.x - realw, pos.y - realh), new Vector2(pos.x + realw, pos.y + realh));
			// box.setAsBoxWithCenterAndAngle(realw.abs() + 1, realh.abs() + 1, pos, 0.0);
			FixtureDef fixture = new FixtureDef();
			fixture.shape = box;
			fixture.density = 1.0;
			fixture.isSensor = true;
			fixture.friction = 0.0;
			if (pos.x.abs() >= 0.5) {
				fixture.userData = "Vertical";
				print("Vertical");
			} else if (pos.y.abs() >= 0.5) {
				fixture.userData = "Horizontal";
				print("Horizontal");
			}
			body.createFixture(fixture);
		}
	}
}
