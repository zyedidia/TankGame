Explosion = function(spritesheet, ctx, x, y, numFrames, srcSize) {
	this.img = spritesheet;
	this.ctx = ctx;
	this.x = x; this.y = y;
	this.numFrames = numFrames;
	this.srcSize = srcSize;

	this.width = 40; this.height = 40;

	this.curFrame = 0;
	this.curRow = 0;
	this.curColumn = 0;
}

Explosion.prototype.draw = function() {
	if (this.curFrame > this.numFrames) {
		this.destroy();
	}

	var srcX = this.curColumn * this.srcSize;
	var srcY = this.curRow * this.srcSize;
	this.ctx.drawImage(this.img, srcX, srcY, this.srcSize, this.srcSize, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

	if (this.curColumn < 5) {
		this.curColumn++;
	} else {
		this.curColumn = 0;
		this.curRow++;
	}

	this.curFrame++;
}

Explosion.prototype.destroy = function() {
	delete explosions.indexOf(this);
}
