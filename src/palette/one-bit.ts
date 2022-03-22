import Color from '../color';
import { PixelMode } from '../flags';
import Palette from './index';
import type { ColorList, OneBitColors } from './index';

export default class OneBitPalette extends Palette {
  public readonly colors: ColorList;

  public readonly pixelMode: PixelMode = PixelMode.OneBit;

  constructor(off: Color, on: Color);
  constructor(colors: [Color, Color]);
  constructor(off: Color | [Color, Color], on?: Color) {
    super();
    if (off instanceof Color && on instanceof Color) {
      this.colors = [off, on] as OneBitColors;
      return;
    }
    this.colors = off as OneBitColors;
  }

  // eslint-disable-next-line class-methods-use-this
  protected toIndex(color: Color): 0 | 1 {
    const {
      r,
      g,
      b,
      a,
    } = color;
    if ([r | g | b, a].some((brightness) => brightness < 0x80)) {
      return 0;
    }
    return 1;
  }
}
