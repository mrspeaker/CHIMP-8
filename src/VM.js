"use strict";

window.VM = {

	cpuSpeed: 500 / 4,

	RAM: null,
	display: null,
	keys: null,

	start: 0x200,
	pc: 0,
	I: 0,
	V: null,
	DT: 0,
	ST: 0,

	stack: null,
	waitingForKeyPress: false,

	init: function () {

		this.display = Object.create(window.Display).init("#screen");
		this.sound = Object.create(window.Sound).init();

		var keys = this.keys = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		this.RAM = new Uint8Array(new ArrayBuffer(0x1000));
		this.V = new Uint8Array(new ArrayBuffer(16));
		this.stack = [];

		this.bindKeys();

		this.storeFont();

		return this;

	},

	bindKeys: function () {

		var keyed = function (code, isDown) {

			var k = -1;

			switch (code) {
				case 49: k = 0x1; break;
				case 50: k = 0x2; break;
				case 51: k = 0x3; break;
				case 52: k = 0xC; break;
				case 81: k = 0x4; break;
				case 87: k = 0x5; break;
				case 69: k = 0x6; break;
				case 82: k = 0xD; break;
				case 65: k = 0x7; break;
				case 83: k = 0x8; break;
				case 68: k = 0x9; break;
				case 70: k = 0xE; break;
				case 90: k = 0xA; break;
				case 88: k = 0x0; break;
				case 67: k = 0xB; break;
				case 86: k = 0xF; break;
			}

			if (k < 0) return;

			this.keys[k] = isDown ? 0x1 : 0x0;

		}.bind(this);

		document.addEventListener("keydown", function (e) {

			if (e.repeat) {

				return;

			}

			keyed(e.keyCode, true);

		}.bind(this), false);

		document.addEventListener("keyup", function (e) {

			keyed(e.keyCode, false);

		}.bind(this), false);

	},

	storeFont: function () {

		[
			0xF0, 0x90, 0x90, 0x90, 0xF0,
			0x20, 0x60, 0x20, 0x20, 0x70,
			0xF0, 0x10, 0xF0, 0x80, 0xF0,
			0xF0, 0x10, 0xF0, 0x10, 0xF0,
			0x90, 0x90, 0xF0, 0x10, 0x10,
			0xF0, 0x80, 0xF0, 0x10, 0xF0,
			0xF0, 0x80, 0xF0, 0x90, 0xF0,
			0xF0, 0x10, 0x20, 0x40, 0x40,
			0xF0, 0x90, 0xF0, 0x90, 0xF0,
			0xF0, 0x90, 0xF0, 0x10, 0xF0,
			0xF0, 0x90, 0xF0, 0x90, 0x90,
			0xE0, 0x90, 0xE0, 0x90, 0xE0,
			0xF0, 0x80, 0x80, 0x80, 0xF0,
			0xE0, 0x90, 0x90, 0x90, 0xE0,
			0xF0, 0x80, 0xF0, 0x80, 0xF0,
			0xF0, 0x80, 0xF0, 0x80, 0x80
		].map(function (b, i) {

			this.RAM[i] = b;

		}, this);

	},

	load: function (prg) {

		this.pc = this.start;

		for (var i = 0; i < prg.length; i++) {

			this.RAM[this.pc + i] = prg[i];

		}

		vm.waitingForKeyPress = false;

		console.log("Loaded " + prg.length + " bytes.");

	},

	run: function () {

		this.stop();

		this.timer = setInterval(function () {
			//this.step();
			//this.step();
			//this.step();
			//this.step();
		}.bind(this), 1000);//1000 / this.cpuSpeed);

		this.sixtyHz();

	},

	stop: function () {

		clearInterval(this.timer);
		//clearInterval(this.timer_dt);

	},

	reset: function () {

		this.display.clear();
		this.waitingForKeyPress = false;
		this.V = new Uint8Array(new ArrayBuffer(0x10));
		this.pc = this.start;
		window.debugga && window.debugga(this);

	},

	step: function () {

		function verify (addr) {

			if (addr < 0x200 || addr > 0xFFE) {

				throw new Error("Illegal jump location:" + addr.toString(16));

			}

			return addr;

		}

		if (this.waitingForKeyPress) {

			if (!this.keys.some(function (k) { return k === 0x1; })) {
				return;
			}

			this.waitingForKeyPress = false;
			this.V[this.waitingStore] = this.keys.indexOf(0x1);

		}

		var instruction = (this.RAM[this.pc] << 8) | this.RAM[this.pc + 1],
			di = "0x" + instruction.toString(16),
			addr,
			i;

		this.pc += 2;

		var x = (instruction & 0x0F00) >> 8,
			y = (instruction & 0x00F0) >> 4,
			nnn = instruction & 0x0FFF,
			nn = instruction & 0x00FF,
			n = instruction & 0x000F;

		switch (instruction & 0xF000) {

		case 0x0000:

			switch (nnn) {
			case 0x000:
				// Empty opcode
				break;

			case 0x0E0:
				// 00E0: Clears the screen.
				this.display.clear();
				break;

			case 0x0EE:
				// 00EE: Returns from a subroutine.
				if (this.stack.length == 0) {
					throw new Error("No call stack to pop from");
				}
				this.pc = this.stack.pop();
				break;

			default:
				console.log("NOP 0x0nnn.");
				// Jump to nnnn? 0NNN: Calls RCA 1802 program at address NNN.
				//this.pc = verify(nnn);
				break;
			}

			break;

		case 0x1000:
			// 1NNN Jumps to address NNN.
			this.pc = verify(nnn);
			break;

		case 0x2000:
			// 2NNN: Calls subroutine at NNN.
			if (this.stack.push(this.pc) > 64) {
				throw new Error("Stack too large.");
			}
			this.pc = verify(nnn);
			break;

		case 0x3000:
			//3XNN: Skips the next instruction if VX equals NN.
			if (this.V[x] == nn) {
				this.pc += 2;
			}
			break;

		case 0x4000:
			// 4XNN: Skips the next instruction if VX doesn't equal NN.
			if (this.V[x] != nn) {
				this.pc += 2;
			}
			break;

		case 0x5000:
			// 5XY0: Skips the next instruction if VX equals VY.
			if (this.V[x] == this.V[y]) {
				this.pc += 2;
			}
			break;

		case 0x6000:
			// 6XNN: Sets VX to NN.
			this.V[x] = nn;
			break;

		case 0x7000:
			//7XNN: Adds NN to VX.
			this.V[x] += nn;
			break;

		case 0x8000:

			switch (n) {

			case 0x0:
				// 8XY0: Sets VX to the value of VY.
				this.V[x] = this.V[y];
				break;

			case 0x1:
				// 8XY1: Sets VX to VX or VY.
				this.V[x] = this.V[x] | this.V[y];
				break;

			case 0x2:
				// 8XY2: Sets VX to VX and VY.
				this.V[x] = this.V[x] & this.V[y];
				break;

			case 0x3:
				// 8XY3: Sets VX to VX xor VY.
				this.V[x] = this.V[x] ^ this.V[y];
				break;

			case 0x4:
				// 8XY4: Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
				this.V[0xF] = (this.V[x] += this.V[y]) > 0xFF ? 0x1 : 0x0;
				break;

			case 0x5:
				// 8XY5: VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
				this.V[0xF] = (this.V[x] -= this.V[y]) < 0x0 ? 0x0 : 0x1;
				break;

			case 0x6:
				// 8XY6: Shifts VX right by one. VF is set to the value of the least significant bit of VX before the shift.[2]
				this.V[0xF] = this.V[x] & 0x1;
				this.V[x] = this.V[x] >> 1;
				break;

			case 0x7:
				// 8XY7: Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
				//this.V[0xF] = (this.V[x] = this.V[y] - this.V[x]) < 0x0 ? 0x0 : 0x1;
				this.V[0xF] = this.V[x] > this.V[y] ? 0x0 : 0x1;
				this.V[x] = this.V[y] - this.V[x];
				break;

			case 0xE:
				// 8XYE: Shifts VX left by one. VF is set to the value of the most significant bit of VX before the shift.[2]
				this.V[0xF] = this.V[x] >> 7;
				this.V[x] = this.V[x] << 1;
				break;

			default:
				console.log("NOP 0x8000", di);
			}

			break;

		case 0x9000:
			// 9XY0: Skips the next instruction if VX doesn't equal VY.
			if (this.V[x] != this.V[y]) {
				this.pc += 2;
			}
			break;

		case 0xA000:
			// ANNN: Sets I to the address NNN.
			this.I = nnn;
			break;

		case 0xB000:
			// BNNN: Jumps to the address NNN plus V0.
			this.pc = verify(nnn + this.V[0]);
			break;

		case 0xC000:
			// CXNN: Sets VX to a random number and NN.
			this.V[x] = (Math.random () * 0xFF) & nn;
			break;

		case 0xD000:
			//DXYN: Sprites stored in memory at location in index register (I),
			// maximum 8bits wide. Wraps around the screen. If when drawn, clears
			// a pixel, register VF is set to 1 otherwise it is zero. All drawing
			// is XOR drawing (i.e. it toggles the screen pixels)

			var collision = this.drawSprite(this.V[x], this.V[y], this.I, n);
			this.V[0xF] = collision ? 0x1 : 0;

			break;

		case 0xE000:
			switch (nn) {
			case 0x9E:
				// EX9E: Skips the next instruction if the key stored in VX is pressed.
				// TODO: is this gaurd needed? Or should it be a mask (VX & 0xF)?
				if (this.V[x] <= 0xF) {
					if (this.keys[this.V[x]]) {
						this.pc += 2;
					}
				}

				break;

			case 0xA1:
				//EXA1: Skips the next instruction if the key stored in VX isn't pressed.
				if (this.V[x] <= 0xF) {
					if (!this.keys[this.V[x]]) {
						this.pc += 2;
					}
				}
				break;

			default:
				console.log("NOP 0xE000:", di);
			}
			break;

		case 0xF000:

			switch (nn) {

			case 0x07:
				// FX07: Sets VX to the value of the delay timer.
				this.V[x] = this.DT;
				break;

			case 0x0A:
				//FX0A: A key press is awaited, and then stored in VX.
				this.keys = this.keys.map(function (k) { return 0x0; });
				this.waitingForKeyPress = true;
				this.waitingStore = x;
				break;

			case 0x15:
				//FX15 Sets the delay timer to VX.
				this.DT = this.V[x];
				break;

			case 0x18:
				// FX18: Sets the sound timer to VX.
				this.ST = this.V[x];
				if (this.ST > 0) {

					this.soundOn();

				}
				break;

			case 0x1E:
				// FX1E: Adds VX to I.[3]  VF is set to 1 when range overflow (I+VX>0xFFF), and 0 when there isn't. This is undocumented feature of the Chip-8
				this.V[0xF] = (this.I += this.V[x]) > 0xFFF ? 1 : 0;
				if (this.I > 0xFFF) this.I -= 0xFFF;
				break;

			case 0x29:
				// FX29: Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font.
				this.I = 0x00 + (this.V[x] * 5);
				break;

			case 0x33:
				// FX33: Stores the Binary-coded decimal representation of VX, with the most significant
				// of three digits at the address in I, the middle digit at I plus 1, and the least
				// significant digit at I plus 2.
				this.RAM[this.I + 0] = this.V[x] % 1000 / 100 | 0;
				this.RAM[this.I + 1] = this.V[x] % 100 / 10 | 0;
				this.RAM[this.I + 2] = this.V[x] % 10 | 0;
				break;

			case 0x55:
				// FX55: Stores V0 to VX in memory starting at address I.[4]
				for (i = 0; i <= x; i++) {
					this.RAM[this.I + i] = this.V[i];
				}

				// "The value of the I register after save and restore opcodes is not well defined.""
				// if compatibitiy  - this.I = this.I + i;

				break;

			case 0x65:
				// FX65: Fills V0 to VX with values from memory starting at address I.[4]
				for (i = 0; i <= x; i++) {

					this.V[i] = this.RAM[this.I + i];

				}

				// "The value of the I register after save and restore opcodes is not well defined.""
				// compat: this.I = this.I + i;

				break;

			default:
				console.log("NOP 0xF000:", di);
				break;

			}

			break;

		default:
			console.log("NOP", di);

		}

		window.debugga && window.debugga(this);

	},

	sixtyHz: function () {

		if (this.timer) {

			this.step();
			this.step();
			this.step();
			this.step();
			this.step();
			this.step();

			if (this.DT > 0) {

				this.DT -= 1;

			}

			if (this.ST > 0) {

				this.ST -= 1;
				if (this.ST <= 0) {

					this.soundOff();

				}

			}
		}

		this.display.render();

		requestAnimationFrame(this.sixtyHz.bind(this))

	},

	drawSprite: function (x, y, address, numBytes) {

		var collision = false,
			line,
			bits,
			bit;

		for (line = 0; line < numBytes; line++) {

			bits = this.RAM[address + line];

			for (bit = 7; bit >= 0; bit--) {

				if (bits & 1) {

					if (!this.display.xorPixel(x + bit, y + line)){
						collision = true;
					};

				}

				bits >>= 1;

			}

		}

		return collision;

	},

	soundOn: function () {

		this.sound.on();

	},

	soundOff: function () {

		this.sound.off();

	}

};

