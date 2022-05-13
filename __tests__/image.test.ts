import { Image } from '../src/index';
import * as palette from '../src/palette';
import {
  PixelMode,
  PaletteIncluded,
  ColorChannels,
  ColorAccuracy,
} from '../src/flags';

describe('Image', () => {
  describe('constructor', () => {
    test.each([
      [PixelMode.OneBit, PaletteIncluded.No, ColorChannels.Grayscale, ColorAccuracy.TwoBit],
      [PixelMode.EightBit, PaletteIncluded.Yes, ColorChannels.RGBA, ColorAccuracy.EightBit],
    ])('can be constructed from mode tuple [%p, %p, %p, %p]', (
      pixelMode: PixelMode,
      paletteIncluded: PaletteIncluded,
      colorChannels: ColorChannels,
      colorAccuracy: ColorAccuracy,
    ) => {
      const m = new Image(
        [pixelMode, paletteIncluded, colorChannels, colorAccuracy],
        2, 3,
        palette.default8Bit,
        [0x00, 0x10, 0x01, 0x11, 0xF0, 0x0F],
      );
      expect(m.pixelMode).toBe(pixelMode);
      expect(m.paletteIncluded).toBe(paletteIncluded);
      expect(m.colorChannels).toBe(colorChannels);
      expect(m.colorAccuracy).toBe(colorAccuracy);
    });
  });
});
