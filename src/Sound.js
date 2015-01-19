var Sound = {

	init: function () {

		var ctx;
		try {

			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			ctx = new AudioContext();
		}
		catch (e) {

			console.log("No web audio");

		}

		if (!ctx) { return; }

		var vco = ctx.createOscillator();
		vco.type = "sin";
		vco.frequency.value = 261.63;

		var vca = ctx.createGain();
		vca.gain.value = 0;

		vco.connect(vca);
		vca.connect(ctx.destination);

		vco.start(0);

		this.vca = vca;

		return this;

	},

	on: function () {

		if (this.vca) {

			this.vca.gain.value = 1;

		}

	},

	off: function () {

		if (this.vca) {

			this.vca.gain.value = 0;

		}

	}

};
