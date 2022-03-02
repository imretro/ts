export type HexDigit = string | number;

export type HexCode = `#${HexDigit}${HexDigit}${HexDigit}${HexDigit}${HexDigit}${HexDigit}`;

/**
 * A representation of a color.
 *
 * RGBA values are in `[0, 256)`.
 */
export default abstract class Color {
  public abstract get r(): number;
  public abstract get g(): number;
  public abstract get b(): number;
  public abstract get a(): number;

  public get hex(): HexCode {
    const radix = 16;
    const r = this.r.toString(radix).padStart(2, '0');
    const g = this.g.toString(radix).padStart(2, '0');
    const b = this.b.toString(radix).padStart(2, '0');
    return `#${r}${g}${b}` as HexCode;
  }

  /**
   * A number between `0` and `1`.
   */
  get opacity(): number {
    return this.a / 0xFF;
  }
}
