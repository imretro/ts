import type Color from './color';

export type PaletteColors<C extends Color> = Array<C>;

export interface OneBitColors<C extends Color> extends PaletteColors<C> {
  length: 2;
}

export interface TwoBitColors<C extends Color> extends PaletteColors<C> {
  length: 4;
}

export interface EightBitColors<C extends Color> extends PaletteColors<C> {
  length: 256;
}

export type ColorList<C extends Color> = OneBitColors<C> | TwoBitColors<C> | EightBitColors<C>;

export default class Palette<C extends Color> {
  readonly colors: ColorList<C>;

  constructor(colors: ColorList<C>) {
    this.colors = colors;
  }
}
