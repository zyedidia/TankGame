import 'dart:html';
import 'package:box2d/box2d_browser.dart';

var world;
var viewport;

void setup() {
	var gravity = new Vector2(0.0, -10.0);
	bool doSleep = true;
	world = new World(gravity, doSleep, new DefaultWorldPool());
}

void initialize() {
	Body ground;
	{
		BodyDef bd = new BodyDef();
		bd.position.setValues(0.0, 0.0);
		assert(world != null);
		ground = world.createBody(bd);

		PolygonShape sd = new PolygonShape();
		sd.setAsBox(10.0, 10.0);

		FixtureDef fixtureDef = new FixtureDef();
		fixtureDef.shape = sd;
		fixtureDef.density = 1.0;
		fixtureDef.friction = 0.3;

		ground.createFixture(fixtureDef);
		ground.userData = "Ground";
	}

	Body body;
	{
		BodyDef bodyDef = new BodyDef();
		bodyDef.type = BodyType.DYNAMIC;
		bodyDef.position.setValues(20.0, 20.0);
		body = world.createBody(bodyDef);

		PolygonShape dynamicBox = new PolygonShape();
		dynamicBox.setAsBox(100.0, 10.0);

		FixtureDef fixtureDef = new FixtureDef();
		fixtureDef.shape = dynamicBox;
		fixtureDef.density = 1.0;
		fixtureDef.friction = 0.3;

		body.createFixture(fixtureDef);
		body.userData = "Body";
	}
}

var canvas;
var ctx;
var width, height;

void init() {
	canvas = querySelector('#canvas');
	ctx = canvas.context2D;
	width = canvas.width;
	height = canvas.height;

	final extents = new Vector2(width / 2, height / 2);
	viewport = new CanvasViewportTransform(extents, extents);
	viewport.scale = 1;

	setup();
	initialize();

	var debugDraw = new CanvasDraw(viewport, ctx);

	world.debugDraw = debugDraw;

	var frameCount = 0;
}

void run() {
	window.requestAnimationFrame(step);
}

void step(num timestamp) {
	world.step(1/20.0, 8, 3);

	for (Body b = world.bodyList; b != null; b = b.next) {
		int i = 0;
		RayCastInput input = new RayCastInput();
		input
			..p1 = new Vector2(0.0, 0.0)
			..p2 = new Vector2(20.0, 20.0)
			..maxFraction = 20.0;

		RayCastOutput output = new RayCastOutput();
		print("${b.originTransform.position}");
		print("${b.originTransform.rotation}");
		print("${b.fixtureList.raycast(output, input, 1)}");

	}

	ctx.clearRect(0, 0, width, height);
	world.drawDebugData();

	ctx.beginPath();
	var p1 = new Vector2(0.0, 0.0);
	var p2 = new Vector2(20.0, 20.0);
	viewport.getWorldToScreen(p1, p1);
	viewport.getWorldToScreen(p2, p2);
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();

	window.requestAnimationFrame(step);
}

void main() {
	init();
	run();
}
