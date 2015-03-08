CanvasImage = function(imgElement, ctx) {
	this.ctx = ctx;
	this.imgElement = imgElement;

	this.x = 0, this.y = 0;
	this.width = 0, this.height = 0;
	this.angle = 0;
}

CanvasImage.prototype.draw = function() {
	var toRadians = Math.PI / 180;
	this.ctx.save();
	this.ctx.translate(this.x, this.y);
	this.ctx.rotate(toRadians * this.angle);

	this.ctx.drawImage(this.imgElement, -this.width / 2, -this.height / 2, this.width, this.height);
	this.ctx.restore();
}
