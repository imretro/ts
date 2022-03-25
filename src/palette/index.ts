import type { Color } from '@imretro/color';
import { PixelMode } from './flags';
import type { ColorCount } from './util';

export type PaletteColors = Array<Color>;

export interface OneBitColors extends PaletteColors {
  length: 2;
}

export interface TwoBitColors extends PaletteColors {
  length: 4;
}

export interface EightBitColors extends PaletteColors {
  length: 256;
}

export type ColorList = OneBitColors | TwoBitColors | EightBitColors;
export type ColorListValidator = (list: Color[]) => list is ColorList;

export default abstract class Palette {
  public abstract readonly colors: ColorList;

  public abstract readonly pixelMode: PixelMode;

  /**
   * @returns A count of available colors.
   */
  public get colorCount(): ColorCount {
    return this.colors.length;
  }

  /**
   * Attempts to convert the color to one of the available palette colors.
   *
   * @returns One of the available colors in the palette.
   */
  public convert(color: Color): Color {
    return this.colors[this.toIndex(color)];
  }

  protected abstract toIndex(color: Color): number;
}
