import type Color from './color';

export default class Palette<C extends Color> {
  readonly colors: C[];

  constructor(colors: C[]) {
    this.colors = colors;
  }
}
