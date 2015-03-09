var world;

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width(); // Width
var h = $("#canvas").height(); // Height

var images = [];
var sprites = [];
var updateTime = 1000 / 80;

var lastTime = 0;

init();

start();

function setupWorld() {
	world = new b2World(new b2Vec2(0, 0), true);

	var image = new CanvasImage(images[0], ctx);
	var tank = new Tank(image, world, 9, 15);
	sprites.push(tank);

	var image2 = new CanvasImage(images[2], ctx);
	var obstacle = new Obstacle(image2, world, 20, 20, 10, 2, 2);
	sprites.push(obstacle);

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	var bodyDef = new b2BodyDef;

	//create ground
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = 15;
	bodyDef.position.y = 30;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(10, 0.5);
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(scale);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

	world.SetDebugDraw(debugDraw);
}

function init() {
	loadImage("img/greenTank.png");
	loadImage("img/brownTank.png");
	loadImage("img/obstacle.png");

	setupWorld();
}

function start() {
	window.requestAnimationFrame(run);
}

function run(time) {
	var now = Date.now();
	var delta = now - lastTime;

	if (delta > updateTime) {
		update(delta / 20);
		render();
		lastTime = now - (delta % updateTime);
	}

	window.requestAnimationFrame(run);
}

function update(deltaTime) {

	world.Step(1 / 60, 10, 10);

	for (i in sprites) {
		sprites[i].update(deltaTime);
	}
}

function render() {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);

	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, w, h);

	world.DrawDebugData();
	world.ClearForces();

	for (i in sprites) {
		sprites[i].draw();
	}
}

function addBullet(x, y, angle, speed) {
	var image = new CanvasImage(images[0], ctx);
	image.isCircle = true;
	var bullet = new Bullet(image, world, x, y, angle, speed);
	sprites.push(bullet);
}

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
