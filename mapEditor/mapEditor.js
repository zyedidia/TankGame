// The main canvas to draw the world on
var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width(); // Width
var h = $("#canvas").height(); // Height

var images = [];

var sprites = [];
var scale = 20;

var mouseDown = false;

var selectedSprite;

var keysDown = [];

var gameWidth = 50;
var gameHeight = 50;

var camera = {x: 0, y: 0};

var updateTime = 1000 / 80;
var lastTime = 0;

$(document).ready(function() {
	$("#sprite-x").keyup(function(event) {
		var val = $('#sprite-x').val();
		if (val) {
			selectedSprite.x = val;
		}
	});
	$("#sprite-y").keyup(function(event) {
		var val = $('#sprite-y').val();
		if (val) {
			selectedSprite.y = val;
		}
	});
	$("#sprite-angle").keyup(function(event) {
		var val = $('#sprite-angle').val();
		if (val) {
			selectedSprite.angle = val;
		}
	});
	$("#sprite-width").keyup(function(event) {
		var val = $('#sprite-width').val();
		if (val) {
			selectedSprite.width = val;
		}
	});
	$("#sprite-height").keyup(function(event) {
		var val = $('#sprite-height').val();
		if (val) {
			selectedSprite.height = val;
		}
	});
});

init();
window.requestAnimationFrame(run);

function init() {
	loadImage("img/obstacle.png");
}

function run(time) {
	var now = Date.now();
	var delta = now - lastTime;

	// Make sure we are not updating faster than 80 fps
	if (delta > updateTime) {
		update();
		render();
		lastTime = now - (delta % updateTime);
	}

	window.requestAnimationFrame(run);
}

function update() {
	if (keysDown[38]) {
		camera.y--;
	} if (keysDown[40]) {
		camera.y++;
	}

	if (keysDown[39]) {
		camera.x++;
	} if (keysDown[37]) {
		camera.x--;
	}

	if (keysDown[16]) {
		if (selectedSprite) {
			delete sprites[sprites.indexOf(selectedSprite)];
			selectedSprite = null;
		}
	}
}

function render() {
	// Draw the white background
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);

	ctx.save();
	// Translate everything to look like the camera is moving in the world
	// When actually the world is moving around the camera
	ctx.translate(-camera.x * scale + w / 2, -camera.y * scale + h / 2);

	// Draw the black outline on the edge of the world
	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, gameWidth * scale, gameHeight * scale);

	for (var i in sprites) {
		var s = sprites[i];

		s.draw();
	}

	if (selectedSprite) {
		ctx.strokeStyle = "lightgreen";
		ctx.lineWidth = 2;
		var toRadians = Math.PI / 180;
		ctx.save();
		ctx.translate(selectedSprite.x * scale, selectedSprite.y * scale);
		ctx.rotate(toRadians * selectedSprite.angle);
		ctx.strokeRect(-selectedSprite.width * scale / 2, -selectedSprite.height * scale / 2, selectedSprite.width * scale, selectedSprite.height * scale)

			// ctx.strokeRect(selectedSprite.x * scale - selectedSprite.width * scale / 2, selectedSprite.y * scale - selectedSprite.height * scale / 2, selectedSprite.width * scale, selectedSprite.height * scale);
			ctx.restore();
	}

	ctx.restore();
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	var mousePos = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
	mousePos.x /= scale;
	mousePos.x += camera.x;
	mousePos.x -= w / scale / 2;

	mousePos.y /= scale;
	mousePos.y -= h / scale / 2;
	mousePos.y += camera.y;

	return mousePos;
}

function addObstacle(x, y, angle, width, height) {
	var img = new CanvasImage(images[0]);
	var sprite = new EditorSprite(img, x, y, angle, width, height);
	sprites.push(sprite);
}

// p is mousePos
function getSelectedSprite(p) {
	var resultSprite = null;
	for (var i in sprites) {
		var s = sprites[i];
		var a = {x: s.x - s.width, y: s.y + s.height};
		var b = {x: s.x - s.width, y: s.y - s.height};
		var c = {x: s.x + s.width, y: s.y + s.height};
		var d = {x: s.x + s.width, y: s.y - s.height};

		var sum = getTriangleArea(a, p, d);
		sum += getTriangleArea(d, p, c);
		sum += getTriangleArea(c, p, b);
		sum += getTriangleArea(p, b, a);

		var rectArea = s.width * 2 * s.height * 2;
		console.log(rectArea);
		if (sum < rectArea) {
			resultSprite = s;
		}
	}

	return resultSprite;
}

function getTriangleArea(a, b, c) {
	// Shoelace formula
	return 0.5 * Math.abs((a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y));
}

function saveMap() {
	var outputString = "";

	outputString += gameWidth + " " + gameHeight + "\n";
	outputString += "5 5\n";
	outputString += (gameWidth - 5) + " " + (gameHeight - 5) + "\n";

	for (var i in sprites) {
		var s = sprites[i];
		outputString += s.x + " " + s.y + " " + s.width + " " + s.height + " " + s.angle + "\n";
	}

	console.log(outputString);
	var mapName = prompt("Please name your map (No spaces)", "cool_map");

	if (mapName) {
		mapName += ".txt";
	} else {
		mapName = "map.txt";
	}

	console.log(mapName);

	var file = new Blob([outputString], {
		type: "text/plain;charset=utf-8;",
	});
	saveAs(file, mapName);

	// var data = new FormData();
	// data.append("data", outputString);
	// data.append("filename", mapName);
	// var xhr = new XMLHttpRequest();
	// xhr.open('post', './write.php', true);
	// xhr.send(data);
}

canvas.addEventListener('mousedown', function(evt) {
	mouseDown = true;
	var mousePos = getMousePos(canvas, evt);
	selectedSprite = getSelectedSprite(mousePos);
	if (selectedSprite) {
		$('#sprite-x').val(selectedSprite.x);
		$('#sprite-y').val(selectedSprite.y);
		$('#sprite-angle').val(selectedSprite.angle);
		$('#sprite-width').val(selectedSprite.width);
		$('#sprite-height').val(selectedSprite.height);
	}
}, false);

canvas.addEventListener('mousemove', function(evt) {
	if (mouseDown && selectedSprite) {
		var mousePos = getMousePos(canvas, evt);

		selectedSprite.x = mousePos.x;
		selectedSprite.y = mousePos.y;

		$('#sprite-x').val(selectedSprite.x);
		$('#sprite-y').val(selectedSprite.y);
		$('#sprite-angle').val(selectedSprite.angle);
		$('#sprite-width').val(selectedSprite.width);
		$('#sprite-height').val(selectedSprite.height);
	}
}, false);

canvas.addEventListener('mouseup', function(evt) {
	var mousePos = getMousePos(canvas, evt);

	mouseDown = false;

	if (!selectedSprite) {
		var input = prompt("Width and height", "2 2").split(" ");
		if (input) {
			var width = parseFloat(input[0]);
			var height = parseFloat(input[1]);

			input = prompt("Angle", "0");
			if (input) {
				var angle = parseFloat(input);

				addObstacle(mousePos.x, mousePos.y, angle, width, height);
			}
		}
	}
}, false);

// When a key is pressed, add it to keysDown and send the new array to the server
addEventListener("keydown", function (e) {
	var key = e.keyCode || e.which;
	keysDown[key] = true;
}, false);

// When a key is released, remove it from keysDown and send the new array to the server
addEventListener("keyup", function (e) {
	var key = e.keyCode || e.which;
	delete keysDown[key];
}, false);

function loadImage(imgSrc) {
	var image = new Image();
	image.src = imgSrc;
	images.push(image);
}
