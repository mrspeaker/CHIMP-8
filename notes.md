## Memory

CHIP-8 was most commonly implemented on 4K systems, such as the Cosmac VIP
and the Telemac 1800. These machines had 4096 (0x1000) memory locations,
all of which are 8 bits (a byte) which is where the term CHIP-8 originated.
However, the CHIP-8 interpreter itself occupies the first 512 bytes of the
memory space on these machines. For this reason, most programs written for
the original system begin at memory location 512 (0x200) and do not access
any of the memory below the location 512 (0x200). The uppermost 256 bytes
(0xF00-0xFFF) are reserved for display refresh, and the 96 bytes below that
(0xEA0-0xEFF) were reserved for call stack, internal use, and other variables.

In modern CHIP-8 implementations, there is no need for any of the memory space
to be used, but it is common to store font data in the lower 512 bytes
(0x000-0x200).

## Registers

CHIP-8 has 16 8-bit data registers named from V0 to VF. The VF register
doubles as a carry flag.

The address register, which is named I, is 16 bits wide and is used with
several opcodes that involve memory operations.

## The stack

The stack is only used to store return addresses when subroutines are called.
The original 1802 version allocated 48 bytes for up to 12 levels of nesting;
modern implementations normally have at least 16 levels.

Timers

CHIP-8 has two timers. They both count down at 60 hertz, until they reach 0.

    Delay timer: This timer is intended to be used for timing the events of games.
    Its value can be set and read.
    Sound timer: This timer is used for sound effects. When its value is nonzero,
    a beeping sound is made.

## Input

Input is done with a hex keyboard that has 16 keys which range from 0 to F.
The '8', '4', '6', and '2' keys are typically used for directional input.
Three opcodes are used to detect input. One skips an instruction if a specific
key is pressed, while another does the same if a specific key is not pressed.
The third waits for a key press, and then stores it in one of the data registers.

## Graphics and sound

Display resolution is 64×32 pixels, and color is monochrome. Graphics are drawn
to the screen solely by drawing sprites, which are 8 pixels wide and may be
from 1 to 15 pixels in height. Sprite pixels that are set flip the color of
the corresponding screen pixel, while unset sprite pixels do nothing.
The carry flag (VF) is set to 1 if any screen pixels are flipped from set to
unset when a sprite is drawn and set to 0 otherwise.

As previously described, a beeping sound is played when the value of the
sound timer is nonzero.

## Opcode table

CHIP-8 has 35 opcodes, which are all two bytes long. The most significant byte
is stored first. The opcodes are listed below, in hexadecimal and with the
following symbols:

    NNN: address
    NN: 8-bit constant
    N: 4-bit constant
    X and Y: 4-bit register identifier
