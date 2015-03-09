CanvasImage = function(imgElement, ctx) {
	this.ctx = ctx;
	this.isCircle = this.imgElement == "Circle";
	this.isRect = this.imgElement == "Rect";
	this.imgElement = imgElement;

	this.x = 0, this.y = 0;
	this.width = 0, this.height = 0;
	this.angle = 0;
	this.color = "black";
}

CanvasImage.prototype.draw = function() {
	if (this.isCircle) {
		this.ctx.beginPath();
		this.ctx.arc(this.x, this.y, this.height, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
	} else if (this.isRect) {
		this.ctx.save();
		this.ctx.translate(this.x, this.y);
		this.ctx.rotate(toRadians * this.angle);

		this.ctx.rect(this.width / 2, this.height / 2, this.width, this.height);
		this.ctx.fillStyle = this.color;
		this.ctx.fill();

		this.ctx.restore();
	} else {
		this.ctx.save();
		this.ctx.translate(this.x, this.y);
		this.ctx.rotate(toRadians * this.angle);

		this.ctx.drawImage(this.imgElement, -this.width / 2, -this.height / 2, this.width, this.height);
		this.ctx.restore();
	}
}
