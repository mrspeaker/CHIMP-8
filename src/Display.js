var Display = {

	init: function (container) {

		var can = document.createElement("canvas"),
			cont = container ? document.querySelector(container) : document.body,
			c = can.getContext("2d");

		this.h = 32,
		this.w = 64;
		this.c = c;

		can.width = this.w;
		can.height = this.h;
		cont.appendChild(can);

		c.fillStyle = "#000";
		c.fillRect(0, 0, this.w, this.h);

		this.data = c.getImageData(0, 0, this.w, this.h);

		return this;

	},

	clear: function () {

		for (var i = 0; i < this.data.data.length; i++) {

			this.data.data[i] = (i + 1) % 4 !== 0 ? 0 : 255;

		}

		this.c.putImageData(this.data, 0, 0);

	},

	// Returns true if it turns pixel on
	xorPixel: function(x, y) {

		var pix = x * 4 + y * 4 * this.w,
			flipOn = this.data.data[pix + 1] > 0 ? false : true;

		this.data.data[pix] = flipOn ? 0 : 0;
		this.data.data[pix + 1] = flipOn ? 200 : 0;
		this.data.data[pix + 2] = flipOn ? 0 : 0;
		this.data.data[pix + 3] = 255;

		this.c.putImageData(this.data, 0, 0);

		return flipOn;

	}

};
