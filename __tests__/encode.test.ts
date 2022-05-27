import { Image } from '../src/index';
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
});
