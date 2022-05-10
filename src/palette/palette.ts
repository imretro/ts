import type { Color } from '@imretro/color';
import { Alpha } from '@imretro/color';
import { PixelMode } from '../flags';
import type { ColorCount } from '../util';
import { pixelModeToColors as toColorCount } from '../util';

const noColor = new Alpha(0);

export default abstract class Palette {
  public abstract readonly colors: Color[];

  public abstract readonly pixelMode: PixelMode;

  /**
   * @returns A count of available colors.
   */
  public get colorCount(): ColorCount {
    return toColorCount(this.pixelMode);
  }

  /**
   * Attempts to convert the color to one of the available palette colors.
   *
   * @returns One of the available colors in the palette.
   */
  public convert(color: Color): Color {
    return this.colors[this.toIndex(color)] ?? noColor;
  }

  protected abstract toIndex(color: Color): number;

  /**
   * Allows indexing into a palette.
   */
  public color(index: number): Color {
    return this.colors[index] ?? noColor;
  }
}
