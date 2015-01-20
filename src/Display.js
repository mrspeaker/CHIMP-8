var Display = {

	w: 64,
	h: 32,
	zoom: 7,

	col1: "#5d0",
	col2: "#0a0",
	col3: "#088",

	init: function (container) {

		var can = document.createElement("canvas"),
			cont = container ? document.querySelector(container) : document.body,
			c = can.getContext("2d");

		var off = document.createElement("canvas"),
			coff = off.getContext("2d");

		this.c = c;
		this.coff = coff;

		off.width = this.w;
		off.height = this.h;
		can.width = this.w * this.zoom;
		can.height = this.h * this.zoom;
		cont.appendChild(can);

		c.fillStyle = "#000";
		c.fillRect(0, 0, this.w * this.zoom, this.h * this.zoom);

		this.data = coff.getImageData(0, 0, this.w, this.h);

		return this;

	},

	render: function () {

		var zoom = this.zoom,
			data = this.data.data;

		this.c.globalAlpha = 0.15;
		this.c.fillStyle = "#000";
		this.c.fillRect(0, 0, this.w * this.zoom, this.h * this.zoom);
		this.c.globalAlpha = 1;

		this.c.fillStyle = this.col;

		var x, y, i, r, g, b;

		for (x = 0; x < this.w; x++) {
			for (y = 0; y < this.h; y++) {
				i = (y * this.w + x) * 4;
				r = data[i];
				g = data[i + 1];
				b = data[i + 2];
				a = data[i + 3];

			    if (r !== 0 || g !== 0 || b !== 0) {
			    	this.c.fillStyle = this.col1;
			    	this.c.fillRect(x * zoom, y * zoom, zoom, 1);
			    	this.c.fillRect(x * zoom, y * zoom, 1, zoom);

			    	this.c.fillStyle = this.col3;
			    	this.c.fillRect(x * zoom + 1, y * zoom + (zoom - 1), zoom - 1, 1);
			    	this.c.fillRect(x * zoom + (zoom - 1), y * zoom, 1, zoom );

			    	this.c.fillStyle = this.col2;
			    	this.c.fillRect(x * zoom + 1, y * zoom + 1, zoom - 2, zoom - 2)
			    }
			}
		}

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

		return flipOn;

	}

};
