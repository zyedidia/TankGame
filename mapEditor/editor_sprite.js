EditorSprite = function(img, x, y, angle, width, height) {
	this.x = x; this.y = y;
	this.angle = angle;

	this.width = width; this.height = height;
	this.img = img;
}

EditorSprite.prototype.draw = function() {
	this.img.x = this.x * scale;
	this.img.y = this.y * scale;
	this.img.width = this.width * scale;
	this.img.height = this.height * scale;
	this.img.angle = this.angle;

	this.img.draw();
}
