import type Color from './color';
import { ColorChannels as PaletteType } from './flags';

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

const isOneBit = (arr: Color[]): arr is OneBitColors => arr.length === 2;
const isTwoBit = (arr: Color[]): arr is TwoBitColors => arr.length === 4;
const isEightBit = (arr: Color[]): arr is EightBitColors => arr.length === 256;
const isColorList = (arr: Color[]): arr is ColorList => [
  isOneBit,
  isTwoBit,
  isEightBit,
].some((f) => f(arr));

export default class Palette {
  readonly colors: ColorList;

  constructor(colors: Array<Color>) {
    if (!isColorList(colors)) {
      throw new Error('Not a color list');
    }
    this.colors = colors;
  }

  /**
   * @returns A count of available colors.
   */
  public get colorCount(): 2 | 4 | 256 {
    return this.colors.length;
  }

  public get paletteType(): PaletteType {
    switch (this.colorCount) {
      case 2:
        return PaletteType.Grayscale;
      case 4:
        return PaletteType.RGB;
      case 256:
        return PaletteType.RGBA;
      default:
        throw new Error('unreachable');
    }
  }

  /**
   * Attempts to convert the color to one of the available palette colors.
   *
   * @returns One of the available colors in the palette.
   */
  public convert(color: Color): Color {
    return this.colors[this.toIndex(color)];
  }

  private toIndex(color: Color): number {
    switch (this.paletteType) {
      case PaletteType.Grayscale:
        return Palette.oneBitIndex(color);
      default:
        throw new Error('Unimplemented');
    }
  }

  private static oneBitIndex(color: Color): number {
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
