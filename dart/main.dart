import 'dart:html';
import 'package:box2d/box2d_browser.dart';
import 'image.dart';
import 'tank.dart';
import 'sprite.dart';
import 'bullet.dart';
import 'obstacle.dart';
import 'keyboard.dart';

var img;
var lastTime = 0;
var updateTimer = 1000 / 80;
var ctx;
var width, height;
List<Sprite> sprites = [];
var world;
var viewport;
var raycastBody;

void main() {
	var canvas = querySelector('#canvas');
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;
	ctx = canvas.context2D;
	width = canvas.width;
	height = canvas.height;

	preload();
	setupWorld();

	var tank = new Tank(new Image(Image.images[0], ctx), world, 0.0, 0.0);
	var tank2 = new Tank(new Image(Image.images[1], ctx), world, 50.0, 20.0);

	sprites.add(tank);
	sprites.add(tank2);

	window.requestAnimationFrame(run);
}

void addBullet(x, y, angle) {
	Bullet b = new Bullet(new Image(Image.images[2], ctx), world, x, y, angle, 4);
	sprites.add(b);
}

void setupWorld() {
	var gravity = new Vector2(0.0, 0.0);
	var doSleep = false;
	world = new World(gravity, doSleep, new DefaultWorldPool());

	final extents = new Vector2(width / 2, height / 2);
	viewport = new CanvasViewportTransform(extents, extents);
	viewport.scale = 5;

	sprites.add(new Obstacle(new Image(Image.images[3], ctx), world, 10.0, 0.0, 0.0, 10.0, 10.0));

	// Create our canvas drawing tool to give to the world.
	var debugDraw = new CanvasDraw(viewport, ctx);

	// Have the world draw itself for debugging purposes.
	world.debugDraw = debugDraw;
}

void preload() {
	loadImage("img/greenTank.png");
	loadImage("img/brownTank.png");
	loadImage("img/bullet.png");
	loadImage("img/obstacle.png");
}

void loadImage(src) {
	ImageElement imgSrc = new Element.tag("img");
	imgSrc.src = src;
	Image.images.add(imgSrc);
}

void run(int time) {
	if (time == null) {
		time = new DateTime.now().millisecond;
	}

	update(time);
	render();

	window.requestAnimationFrame(run);
}

void update(time) {

	var curTime = new DateTime.now().millisecondsSinceEpoch;
	if (curTime - lastTime > updateTimer) {
		world.step(1/20.0, 8, 3);

		if (sprites[1].keyboard.isPressed(KeyCode.ENTER)) {

			print("${raycast(new Vector2(0.0, 0.0), new Vector2(20.0, 20.0))}");
		}

		lastTime = curTime;
		var cloneList = new List<Sprite>.from(sprites);
		for (var s in cloneList) {
			s.update();
		}
		for (var s in cloneList) {
			if (s.shouldBeDestroyed) {
				world.destroyBody(s.body);
				sprites.remove(s);
			}
		}
	}
}

void render() {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, width, height);

	for (var s in new List<Sprite>.from(sprites)) {
		s.draw(viewport);
	}

	world.drawDebugData();
}

bool raycast(Vector2 p1, Vector2 p2) {
	bool collided = false;

	BodyDef bodyDef = new BodyDef();
	bodyDef.position.setValues(0.0, 0.0);
	raycastBody = world.createBody(bodyDef);
	PolygonShape box = new PolygonShape();
	box.setAsEdge(p1, p2);
	FixtureDef f = new FixtureDef();
	f.shape = box;
	f.density = 1.0;
	f.friction = 0.0;
	f.userData = "Raycast";
	f.isSensor = true;
	raycastBody.createFixture(f);

	world.step(0, 8, 3);

	for (ContactEdge ce = raycastBody.contactList; ce != null; ce = ce.next) {
		if (ce.contact.touching) {
			collided = true;
			print("Collided");
		}
	}

	world.destroyBody(raycastBody);
	return collided;
}
