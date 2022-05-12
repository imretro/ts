import { Color } from '@imretro/color';
import { PixelMode } from '../flags';
import Palette from './palette';

export default class TwoBitPalette extends Palette {
  public readonly colors: Color[];

  public readonly pixelMode: PixelMode = PixelMode.TwoBit;

  constructor(off: Color, light: Color, strong: Color, full: Color);
  constructor(colors: [Color, Color, Color, Color]);
  constructor(colors: Color[]);
  constructor(
    arg1: Color | Color[],
    light?: Color,
    strong?: Color,
    full?: Color,
  ) {
    super();
    if (arg1 instanceof Color) {
      this.colors = [arg1, ...([light, strong, full] as Color[])];
      return;
    }
    this.colors = arg1;
  }

  // eslint-disable-next-line class-methods-use-this
  protected toIndex(color: Color): 0 | 1 | 2 | 3 {
    const {
      r,
      g,
      b,
      a,
    } = color;
    if (a < 0x80) {
      return 0;
    }
    return (r | g | b) >> 6 as 0 | 1 | 2 | 3;
  }
}
