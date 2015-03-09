var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode || e.which] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode || e.which];
}, false);
