var tracks = {};
function loadAudio(name, src) {
	tracks[name] = new Howl({
		urls: [src]
	});
}

function playAudio(name) {
	var audio = tracks[name];
	if (typeof audio !== 'undefined') {
		audio.play();
	}
}
