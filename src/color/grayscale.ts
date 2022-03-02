import Color from '.';

export default class Grayscale extends Color {
  private readonly alpha = 0xFF;

  constructor(private readonly grayscale: number) {
    super();
  }

  get r() {
    return this.grayscale;
  }

  get g() {
    return this.grayscale;
  }

  get b() {
    return this.grayscale;
  }

  get a() {
    return this.alpha;
  }
}
