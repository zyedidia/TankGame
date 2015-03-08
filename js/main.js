var world;

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width(); // Width
var h = $("#canvas").height(); // Height

var images = [];
var sprites = [];
var updateTime = 1000 / 60;

var lastTime = 0;


init();

start();

function setupWorld() {
	world = new b2World(new b2Vec2(0, 10), true);

	var image = new CanvasImage(images[0], ctx);
	var sprite = new Sprite(image, world, 9, 15);
	sprites.push(sprite);

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
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
	
	setupWorld();
}

function start() {
	window.requestAnimationFrame(run);
}

function run(time) {
	var now = Date.now();
	var delta = now - lastTime;
	update(delta / 1000);
	render();

	lastTime = now;

	window.requestAnimationFrame(run);
}

function update(deltaTime) {

	world.Step(1 / 60, 10, 10);

	for (i in sprites) {
		sprites[i].update();
	}
}

function render() {

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);

	world.DrawDebugData();
	world.ClearForces();
	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, w, h);

	for (i in sprites) {
		sprites[i].draw();
	}

}

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
