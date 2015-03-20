Chat = function(x, y, name) {
	this.x = x; this.y = y;
	this.name = name;
	this.isFocused = false;

	this.maxText = 5;

	var chat = this;

	$('#input').hide();

	this.pastText = [];
}

Chat.prototype.sendMessage = function(msg) {
	this.addMessage(msg);

	socket.emit('chatmessage', msg);
}

Chat.prototype.addMessage = function(msg) {
	this.pastText.unshift(msg);

	if (this.pastText.length > this.maxText) {
		this.pastText.splice(this.maxText, 1);
	}
}

Chat.prototype.keyPressed = function(key) {
	console.log(key);
	if (key == 13) { // Enter key
		var input = $('#input');
		if (!this.isFocused) {
			input.show();
			input.focus();
			this.isFocused = true;
		} else {
			var text = input.val();
			if (text) {
				chat.sendMessage(chat.name + ": " + input.val());
			}
			input.val('');
			input.hide();
			input.blur();
			this.isFocused = false;
		}
	} else if (key == 27) { // Escape key
		var input = $('#input');
		input.val('');
		input.hide();
		input.blur();
		this.isFocused = false;
	}
}

Chat.prototype.render = function() {
	ctx.fillStyle = "black";
	ctx.font = "12px Arial";

	var y = this.y - 30;
	for (i in this.pastText) {
		ctx.fillText(this.pastText[i], this.x, y);
		y -= 15;
	}
}
