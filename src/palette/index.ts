import * as color from '@imretro/color';
import OneBit from './one-bit';
import TwoBit from './two-bit';

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
