import { Image } from '../src/index';
import { EncodeError } from '../src/errors';
import * as flags from '../src/flags';
import * as palettes from '../src/palette';

describe('Image', () => {
  describe('encodedByteCount', () => {
    test.each([
      [new Image(flags.PixelMode.OneBit, 1, 1, palettes.default1Bit, [0]), 12],
      [new Image(flags.PixelMode.OneBit, 2, 2, palettes.default1Bit, Array(4).fill(0)), 12],
      [new Image(flags.PixelMode.OneBit, 3, 4, palettes.default1Bit, Array(12).fill(0)), 13],
      [new Image(flags.PixelMode.TwoBit, 1, 1, palettes.default1Bit, [0]), 12],
      [new Image(flags.PixelMode.TwoBit, 2, 2, palettes.default1Bit, Array(4).fill(0)), 12],
      [new Image(flags.PixelMode.TwoBit, 3, 4, palettes.default1Bit, Array(12).fill(0)), 14],
      [new Image(flags.PixelMode.EightBit, 1, 1, palettes.default1Bit, [0]), 12],
      [new Image(flags.PixelMode.EightBit, 2, 2, palettes.default1Bit, Array(4).fill(0)), 15],
      [new Image(flags.PixelMode.EightBit, 3, 4, palettes.default1Bit, Array(12).fill(0)), 23],
    ])('%p encoded should be %d bytes', (image, expected) => {
      expect(image.encodedByteCount()).toBe(expected);
    });
  });

  describe('encode', () => {
    test.each([
      [
        new Image(flags.PixelMode.TwoBit, 0x001, 0x003, palettes.default2Bit, [0, 1, 2]),
        0b01000000,
        [0x00, 0x10, 0x03],
        [],
        [],
      ],
      [
        new Image(
          flags.PixelMode.TwoBit | flags.PaletteIncluded.Yes,
          0x001,
          0x003,
          palettes.default2Bit,
          [0, 1, 2],
        ),
        0b01100000,
        [0x00, 0x10, 0x03],
        [0b00011011],
        [],
      ],
    ])('Encodes (%p) to bytes %p %p %p %p', (image, mode, dimensions, palette, _pixels) => {
      const encoded = image.encode();
      const byteView = new Uint8Array(encoded);

      const signature = String.fromCharCode(...byteView.slice(0, 7));
      expect(signature).toBe('IMRETRO');

      expect(byteView[7]).toBe(mode);

      expect([...byteView.slice(8, 11)]).toEqual(dimensions);

      expect([...byteView.slice(11, 11 + palette.length)]).toEqual(palette);
    });

    test('throws when buffer is not large enough', () => {
      const image = new Image(0, 1, 1, palettes.default1Bit, [0]);

      expect(() => image.encode(new ArrayBuffer(0))).toThrow(EncodeError);
    });
  });
});
