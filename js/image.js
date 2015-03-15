CanvasImage = function(imgElement) {
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
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.height, 0, 2 * Math.PI, false);
		ctx.fillStyle = this.color;
		ctx.fill();
	} else {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(toRadians * this.angle);

		ctx.drawImage(this.imgElement, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.restore();
	}
}
