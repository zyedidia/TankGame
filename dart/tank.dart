import 'dart:html';
import 'dart:math';
import 'package:box2d/box2d_browser.dart';
import 'image.dart';
import 'keyboard.dart';
import 'sprite.dart';
import 'main.dart';

class Tank extends Sprite {
	var accel = 2;
	var maxSpeed = 2, rotateSpeed = 0.75;
	var keyboard;
	var team;
	var shotCooldown = 0.5, lastShot = 0;
	var health = 10;

	Tank(Image img, World world, double startx, double starty) {
		init(img, world, startx, starty);
		keyboard = new Keyboard();

		team = this.img.img.src.contains("green") ? 0 : 1;

		body.fixtureList.userData = "Tank";
	}

	void update() {
		handleKeys();
		updatePosition();
		checkCollision();
	}

	void handleKeys() {
		var forward, backward, right, left, shouldShoot;

		if (team == 0) {
			forward = keyboard.isPressed(KeyCode.UP);
			backward = keyboard.isPressed(KeyCode.DOWN);
			right = keyboard.isPressed(KeyCode.RIGHT);
			left = keyboard.isPressed(KeyCode.LEFT);
			shouldShoot = keyboard.isPressed(KeyCode.SPACE);
		} else {
			forward = keyboard.isPressed(KeyCode.W);
			backward = keyboard.isPressed(KeyCode.S);
			right = keyboard.isPressed(KeyCode.D);
			left = keyboard.isPressed(KeyCode.A);
			shouldShoot = keyboard.isPressed(KeyCode.SHIFT);
		}

		torque = 0.0;

		if (forward) {
			speed -= accel;
		} if (backward) {
			speed += accel;
		}

		if (!forward && !backward) {
			speed = 0;
		}

		if (right) {
			torque = -rotateSpeed;
		} if (left) {
			torque = rotateSpeed;
		}

		if (speed.abs() > maxSpeed) {
			if (speed > 0) {
				speed = maxSpeed;
			} else {
				speed = -maxSpeed;
			}
		}

		if (shouldShoot) {
			shoot();
		}
	}

	void shoot() {
		var curShot = new DateTime.now().millisecondsSinceEpoch;
		if (curShot - lastShot > (shotCooldown * 1000)) {
			lastShot = curShot;
			var x = body.position.x;
			var y = body.position.y;
			addBullet(x + 10.0 * cos(body.angle + PI / 2), y + 10.0 * sin(body.angle + PI / 2), degrees(body.angle));
		}
	}

	void checkCollision() {
		for (ContactEdge ce = body.contactList; ce != null; ce = ce.next) {
			if (ce.contact.touching) {
				var userData = ce.contact.fixtureA.userData;
				var otherUserData = ce.contact.fixtureB.userData;
				if (userData == "Bullet" || otherUserData == "Bullet") {
					health -= 1;
					if (health <= 0) {
						destroy();
					}
				}
				break;
			}
		}
	}
}
