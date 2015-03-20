var points = [];
var obstacles = [];

// If the mainTank is not null
if (mainTank) {
	// Get the points for line of sight from it
	points = mainTank.lineOfSight(obstacles);
}

// This is where the line of sight is drawn from the points given by the tank
if (points.length > 0) {
	// Draw a big light gray rectangle over everything
	// Draw this in the mask canvas
	maskCtx.fillStyle = "lightgray";
	maskCtx.fillRect(0, 0, gameWidth * scale, gameHeight * scale);

	maskCtx.save();

	// This will clip the next drawn shape out of the big rectangle
	maskCtx.globalCompositeOperation = 'xor';

	// Draw the line of sight
	// This is drawing a polygon over everything that the tank CAN see
	// This clips that shape (everything that the tank can see) out of the big rectangle
	// Leaving you with everything the tank can't see covered
	maskCtx.beginPath();

	maskCtx.moveTo(points[0].x * scale, points[0].y * scale);
	for (i = 1; i < points.length; i++) {
		maskCtx.lineTo(points[i].x * scale, points[i].y * scale);
	}
	maskCtx.closePath();
	maskCtx.fill();
	maskCtx.restore();

	ctx.drawImage(maskCanvas, 0, 0);
	maskCtx.fillStyle = "lightgray";
	maskCtx.fillRect(0, 0, gameWidth * scale, gameHeight * scale);

	maskCtx.save();

	maskCtx.globalCompositeOperation = 'xor';

	// maskCtx.arc(mainTank.body.GetPosition().x * scale, mainTank.body.GetPosition().y * scale, 100, 0, 2 * Math.PI, false);
	// maskCtx.fill();

	maskCtx.save();
	maskCtx.translate(mainTank.body.GetPosition().x * scale, mainTank.body.GetPosition().y * scale);
	maskCtx.rotate(mainTank.body.GetAngle());

	maskCtx.beginPath();
	maskCtx.moveTo(0, 50);
	maskCtx.lineTo(-400, -400);
	maskCtx.lineTo(400, -400);
	maskCtx.closePath();
	maskCtx.fill();
	maskCtx.restore();

	// maskCtx.fill();
	maskCtx.restore();
	// Draw the maskCanvas on the real canvas
	ctx.drawImage(maskCanvas, 0, 0);
}

// Now draw all the obstacles over the line of sight (meaning you can always see obstacles)
for (i in obstacles) {
	obstacles[i].draw();
}
