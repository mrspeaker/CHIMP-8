function debugga (VM) {

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
			return hx;
		},
		html = [];

		reg.innerHTML = "<br/>";
		for (var i = 0; i < VM.V.length; i++) {
			reg.innerHTML += "<strong>V" + i.toString(16) + "</strong>:" + VM.V[i] + "<br/>";
		}

		html.push("<br/>&nbsp;I:" + h(VM.I) + "<br/>" + "PC:" + h(VM.pc));

		var disp = function (pc) {

			var out = [],
				instruction = (VM.RAM[pc] << 8) + VM.RAM[pc + 1],
				x = (instruction & 0x0F00) >> 8,
				y = (instruction & 0x00F0) >> 4,
				n = instruction & 0x000F,
				nn = instruction & 0x00FF,
				nnn = instruction & 0x0FFF;

			switch (instruction & 0xF000) {
			case 0x0000:
				switch (nnn) {
				case 0x0E0: out.push("Clear screen"); break;
				case 0x0EE: out.push("Return"); break;
				default: out.push("0x0000."); break;
				}
				break;
			case 0x1000: out.push("JMP to " + h(nnn)); break;
			case 0x2000: out.push("Call " + h(nnn)); break;
			case 0x3000: out.push("Skip if V" + h(x) + " is " + h(nn)); break;
			case 0x6000: out.push("Set V"+ h(x) + " to " + h(nn)); break;
			case 0x7000: out.push("Add " + h(nn) + " to V" + x); break;
			case 0xA000: out.push("Set I to ", h(nnn)); break;
			case 0xC000: out.push("Random & " + h(nn) + " in V" + x); break;
			case 0xD000: out.push("Drawing " + h(n) + " bytes at I from V" + x + ", V" + y); break;

			default:
				out.push(".");
			}

			return h(instruction, 4) + ": " + out.join(" ");
		};

		html.push("<br/><br/>");

		[-8, -6, -4, -2, 0, 2, 4, 6, 8].forEach(function (c, i) {
			var off = c > 0 ? ("+" + c) : (c < 0 ? c : "&nbsp&nbsp");
			html.push("<br/>i" + off + ": ");
			if (c == 0) { html.push("<strong>"); }
			html.push(disp(VM.pc + c));
			if (c == 0) { html.push("</strong>"); };
		});

		pc.innerHTML = html.join("");
};
