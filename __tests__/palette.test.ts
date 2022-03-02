import { Palette } from '../src/index';
import { GrayscaleColor } from '../src/index';

describe('Palette', () => {
  describe('convert', () => {
    describe('OneBitPixels', () => {
      const palette = new Palette([
        new GrayscaleColor(0xFF),
        new GrayscaleColor(0),
      ]);

      const dark = new GrayscaleColor(0x40);
      const light = new GrayscaleColor(0xB0);

      test.each([
        [dark, 0xFF, 0xFF, 0xFF, 0xFF],
        [light, 0, 0, 0, 0xFF],
      ])('%p converted is [%i, %i, %i, %i]', (color, er, eg, eb, ea) => {
        const {r, g, b, a } = palette.convert(color);

        expect(r).toBe(er);
        expect(g).toBe(eg);
        expect(b).toBe(eb);
        expect(a).toBe(ea);
      });
    });
  });
});
