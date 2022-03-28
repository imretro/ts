import * as color from '@imretro/color';
import OneBit from './one-bit';
import TwoBit from './two-bit';
import EightBit from './eight-bit';

export * from './palette';
export { default as Palette } from './palette';
export { default as OneBit } from './one-bit';

/**
 * The default 1-bit pixel-mode palette.
 */
export const default1Bit = new OneBit(new color.Grayscale(0), new color.Grayscale(0xFF));
/**
 * The default 2-bit pixel-mode palette.
 */
export const default2Bit = new TwoBit(
  new color.Grayscale(0),
  new color.Grayscale(0x55),
  new color.Grayscale(0xAA),
  new color.Grayscale(0xFF),
);

const default8BitColors = Array.from({ length: 256 })
  .map((_, index) => new color.RGBA(
    index & 0b11,
    (index >> 2) & 0b11,
    (index >> 4) & 0b11,
    (index >> 6),
  ));

/**
 * The default 8-bit pixel-mode palette.
 */
export const default8Bit = new EightBit(default8BitColors);
