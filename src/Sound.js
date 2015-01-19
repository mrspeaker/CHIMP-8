var Sound = {

	init: function () {

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		
		this.ctx = new AudioContext();

		var vco = this.ctx.createOscillator();
		vco.type = "sin";
		vco.frequency.value = 261.63;

		var vca = this.ctx.createGain();
		vca.gain.value = 0;

		vco.connect(vca);
		vca.connect(this.ctx.destination);

		vco.start(0);

		this.vca = vca;

		return this;

	},

	on: function () {

		this.vca.gain.value = 1;

	},

	off: function () {

		this.vca.gain.value = 0;

	}

};
