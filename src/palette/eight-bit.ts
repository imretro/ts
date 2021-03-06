import { Color } from '@imretro/color';
import { PixelMode } from '../flags';
import Palette from './palette';

export default class EightBitPalette extends Palette {
  public readonly colors: Color[];

  public readonly pixelMode: PixelMode = PixelMode.EightBit;

  constructor(colors: Color[]) {
    super();
    this.colors = colors;
  }

  // eslint-disable-next-line class-methods-use-this
  protected toIndex(color: Color): number {
    const {
      r,
      g,
      b,
      a,
    } = color;
    return (r >> 6) | ((g & 0xC0) >> 4) | ((b & 0xC0) >> 2) | (a & 0xC0);
  }
}
