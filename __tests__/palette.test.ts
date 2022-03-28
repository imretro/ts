import OneBitPalette from '../src/palette/one-bit';
import { Grayscale } from '@imretro/color';

describe('Palette', () => {
  describe('OneBitPalette', () => {
    describe('convert', () => {
      const palette = new OneBitPalette(new Grayscale(0xFF), new Grayscale(0));

      const dark = new Grayscale(0x40);
      const light = new Grayscale(0xB0);

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
