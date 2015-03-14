Chat = function(x, y, name) {
	this.x = x; this.y = y;
	this.name = name;
	this.isFocused = false;

	var chat = this;
	this.input = new CanvasInput({
		x: this.x,
		y: this.y,
		canvas: document.getElementById('canvas'),
		fontSize: 12,
		width: 150,
		fontFamily: 'Arial',
		onsubmit: function() {
			chat.sendMessage(chat.name + ": " + this.value());
			this.value("");
			this.blur();
			chat.isFocused = false;
		}
	});
	this.pastText = [];
}

Chat.prototype.sendMessage = function(msg) {
	this.addMessage(msg);

	socket.emit('chatmessage', msg);
}

Chat.prototype.addMessage = function(msg) {
	this.pastText.unshift(msg);
}

Chat.prototype.keyPressed = function(key) {
	console.log("Key: " + key);
	if (key == 84) {
		this.input.focus();
		this.isFocused = true;
	} else if (key == 27) {
		this.input.blur();
		this.isFocused = false;
	}
}

Chat.prototype.render = function() {
	if (this.isFocused) {
		this.input.render();
	}

	ctx.fillStyle = "black";
	ctx.font = "12px Arial";

	var y = this.y - 30;
	for (i in this.pastText) {
		ctx.fillText(this.pastText[i], this.x, y);
		y -= 15;
	}
}
