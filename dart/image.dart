import 'dart:html';
import 'dart:math';

class Image {
	static var images = [];

	ImageElement img;
	var ctx;
	var x, y;
	var width, height;
	var angle;
	var scale = 0.3;

	Image(img, context) {
		ctx = context;

		this.img = img;
	}

	void draw() {
		var toRadians = PI / 180; 
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(toRadians * angle);

		ctx.drawImageScaled(img, -width / 2, -height / 2, width, height);
		ctx.restore();
	}
}
