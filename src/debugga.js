function debugga (VM) {

	"use strict";

	if (!window.debugga.run) {
		return;
	}

	var reg = document.querySelector("#reg"),
		pc = document.querySelector("#pc"),
		h = function (i, min) {
			var hx = i.toString(16);
			while (min && hx.length < min) {
				hx = "0" + hx;
			}
			return hx.toUpperCase();
		},
		html = [];

		reg.innerHTML = "<br/>";
		for (var i = 0; i < VM.V.length; i++) {
			reg.innerHTML += "<strong>v" + i.toString(16).toUpperCase() + "</strong>:" + h(VM.V[i]) + "<br/>";
		}

		html.push("<br/>&nbsp;I:" + h(VM.I) + "<br/>" + "PC:" + h(VM.pc));

		var disp = function (pc) {

			var out = [],
				instruction = (VM.RAM[pc] << 8) + VM.RAM[pc + 1],
				x = h((instruction & 0x0F00) >> 8),
				y = h((instruction & 0x00F0) >> 4),
				n = instruction & 0x000F,
				nn = instruction & 0x00FF,
				nnn = instruction & 0x0FFF;

			switch (instruction & 0xF000) {
			case 0x0000:
				switch (nnn) {
				case 0x0E0: out.push("clear (Clear screen)"); break;
				case 0x0EE: out.push("ret (Return from subroutine)"); break;
				default: out.push("jump " + h(nnn) + "."); break;
				}
				break;
			case 0x1000: out.push("jump " + h(nnn)); break;
			case 0x2000: out.push("call " + h(nnn)); break;
			case 0x3000: out.push("skip.eq v" + x + ", " + h(nn)); break;
			case 0x4000: out.push("skip.ne v" + x + ", " + h(nn)); break;
			case 0x5000: out.push("skip.eq v" + x + ", v" + y); break;
			case 0x6000: out.push("load v"+ x + ", " + h(nn)); break;
			case 0x7000: out.push("add v" + x + ", " + h(nn)); break;
			case 0x8000:
				switch (n) {
				case 0x0: out.push("load v" + x + ", v" + y); break;
				case 0x1: out.push("or v" + x +", v" + y); break;
				case 0x2: out.push("and v" + x +", v" + y); break;
				case 0x3: out.push("xor v" + x +", v" + y); break;
				case 0x4: out.push("add v" + x +", v" + y); break;
				case 0x5: out.push("sub v" + x +", v" + y); break;
				case 0x6: out.push("shr v" + x); break;
				case 0x7: out.push("dif v" + x + ", v" + y); break;
				case 0xe: out.push("shl v" + x); break;
				default: out.push("reg op ???"); break;
				}
				break;
			case 0x9000: out.push("skip.ne v" + x + ", v" + y); break;
			case 0xA000: out.push("load I, ", h(nnn)); break;
			case 0xB000: out.push("jump " + h(nnn) + ", v" + x + "."); break;
			case 0xC000: out.push("rnd v" + x + ", " + h(nn)); break;
			case 0xD000: out.push("draw v" + x + ", v" + y + ", " + h(n)); break;
			case 0xE000:
				switch (nn) {
				case 0x9E: out.push("jump.key.eq v" + x); break;
				case 0xA1: out.push("jump.key.neq v" + x); break;
				}
				break;
			case 0xF000:
				switch (nn) {
				case 0x07: out.push("load v" + x + ", DT"); break;
				case 0x0A: out.push("block.key v" + x); break;
				case 0x15: out.push("load DT, v" + x); break;
				case 0x18: out.push("load ST, v" + x); break;
				case 0x1e: out.push("add I, v" + x); break;
				case 0x29: out.push("load I, font v" + x); break;
				case 0x33: out.push("bcd" + x); break;
				case 0x55: out.push("load I, v0 to v" + x); break;
				case 0x65: out.push("load v0 to v" + x + ", I"); break;
				default: out.push("???"); break;
				}
				break;
			default:
				out.push(".");
			}

			return h(instruction, 4) + " : " + out.join(" ");
		};

		html.push("<br/><br/>");

		[-8, -6, -4, -2, 0, 2, 4, 6, 8].forEach(function (c) {
			var off = c > 0 ? ("+" + c) : (c < 0 ? c : "&nbsp&nbsp");
			html.push("<br/>" + h(VM.pc + c) + " : ");
			if (c === 0) { html.push("<strong>"); }
			html.push(disp(VM.pc + c));
			if (c === 0) { html.push("</strong>"); }
		});

		pc.innerHTML = html.join("");
}

