import { Color } from '@imretro/color';
import { PixelMode } from '../flags';
import Palette from './palette';

const isColor = (v: unknown): v is Color => v instanceof Color;

export default class OneBitPalette extends Palette {
  public readonly colors: Color[];

  public readonly pixelMode: PixelMode = PixelMode.OneBit;

  constructor(off: Color, on: Color);
  constructor(colors: [Color, Color]);
  constructor(colors: Color[]);
  constructor(off: Color | Color[], on?: Color) {
    super();
    if (isColor(off)) {
      this.colors = [off, on as Color];
      return;
    }
    this.colors = off;
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
