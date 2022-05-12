import OneBitPalette from '../src/palette/one-bit';
import TwoBitPalette from '../src/palette/two-bit';
import EightBitPalette from '../src/palette/eight-bit';
import * as palette from '../src/palette';
import * as color from '@imretro/color';

describe('Palette', () => {
  describe('OneBitPalette', () => {
    describe('convert', () => {
      const palette = new OneBitPalette(new color.Grayscale(0xFF), new color.Grayscale(0));

      const dark = new color.Grayscale(0x40);
      const light = new color.Grayscale(0xB0);

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

  describe('TwoBitPalette', () => {
    describe('convert', () => {
      const colors = [
        new color.Grayscale(0xFF),
        new color.Grayscale(0xAA),
        new color.Grayscale(0x55),
        new color.Grayscale(0),
      ];
      const palette = new TwoBitPalette(colors);

      const darkest = new color.Alpha(0x55);
      const dark = new color.Grayscale(0x56);
      const bright = new color.Grayscale(0xB0);
      const brightest = new color.RGBA(0xFF, 0, 0, 0xFF);

      test.each([
        [darkest, 0xFF, 0xFF, 0xFF, 0xFF],
        [dark, 0xAA, 0xAA, 0xAA, 0xFF],
        [bright, 0x55, 0x55, 0x55, 0xFF],
        [brightest, 0, 0, 0, 0xFF],
      ])('%p converted is [%i, %i, %i, %i]', (color, er, eg, eb, ea) => {
        const { r, g, b, a } = palette.convert(color);

        expect(r).toBe(er);
        expect(g).toBe(eg);
        expect(b).toBe(eb);
        expect(a).toBe(ea);
      });
    });
  });

  describe('EightBitPalette', () => {
    describe('convert', () => {
      const colors = Array.from({ length: 256 }).map((_, index) => new color.Grayscale(index));
      const palette = new EightBitPalette(colors);

      test.each([
        [new color.RGBA(0, 0, 0, 0xFF), 0b11000000, 0b11000000, 0b11000000, 0xFF],
        [new color.RGBA(0b01 << 6, 0, 0, 0), 1, 1, 1, 0xFF],
      ])('%p converted is [%i, %i, %i, %i]', (color, er, eg, eb, ea) => {
        const { r, g, b, a } = palette.convert(color);

        expect(r).toBe(er);
        expect(g).toBe(eg);
        expect(b).toBe(eb);
        expect(a).toBe(ea);
      });
    });
  });

  test.each([
    { name: 'OneBitPalette', value: palette.default1Bit, count: 2 },
    { name: 'TwoBitPalette', value: palette.default2Bit, count: 4 },
    { name: 'EightBitPalette', value: palette.default8Bit, count: 256 },
  ])('colorCount of $name = $count', ({ value, count }) => {
    expect(value.colorCount).toBe(count);
  });
});
