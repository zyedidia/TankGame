import 'image.dart';
import 'package:box2d/box2d_browser.dart';
import 'sprite.dart';
import 'dart:math';

class Bullet extends Sprite {
	var lastTime = 0;
	var bounceCooldown = 40;

	Bullet(Image img, World world, double startx, double starty, double startAngle, double startSpeed) {
		this.img = img;
		createBody(world, startx, starty);
		createShape();
		speed = -startSpeed;
		body.setTransform(new Vector2(startx, starty), radians(startAngle));

		body.bullet = true;
	}

	void createShape() {
		CircleShape dynamicCircle = new CircleShape();
		dynamicCircle.radius = 0.5;
		dimensions = new Vector2(10.0 * dynamicCircle.radius, 10.0 * dynamicCircle.radius);

		FixtureDef fixtureDef = new FixtureDef();
		fixtureDef.shape = dynamicCircle;
		fixtureDef.density = 1.0;
		fixtureDef.friction = 0.0;
		fixtureDef.userData = "Bullet";

		body.createFixture(fixtureDef);
	}

	void update() {
		updatePosition();
		checkCollision();
	}

	void checkCollision() {
		for (ContactEdge ce = body.contactList; ce != null; ce = ce.next) {
			if (ce.contact.touching) {
				var userData = ce.contact.fixtureA.userData;
				var otherUserData = ce.contact.fixtureB.userData;
				if (userData == "Tank" || otherUserData == "Tank") {
					destroy();
				} else if (userData == "Wall" || otherUserData == "Wall") {
					Body obstacle = ce.contact.fixtureA.body;
					if (otherUserData == "Wall") {
						obstacle = ce.contact.fixtureB.body;
					}

					double deltaX = body.position.x - obstacle.position.x;
					double deltaY = body.position.y - obstacle.position.y;

					double rightWallDis = deltaX - obstacle
				}
				break;
			}
		}
	}
}
