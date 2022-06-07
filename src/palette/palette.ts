import type { Color } from '@imretro/color';
import { Alpha } from '@imretro/color';
import { PixelMode } from '../flags';
import type { ColorCount } from '../util';
import type { ColorCb } from './types';
import { pixelModeToColors as toColorCount } from '../util';

const noColor = new Alpha(0);

const colorDistance = (a: Color, b: Color): number => Math.sqrt([
  [a.r, b.r],
  [a.g, b.g],
  [a.b, b.b],
  [a.a, b.a],
]
  .map(([a1, a2]) => (a1 - a2) ** 2)
  .reduce((sum, d) => sum + d, 0));

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
    return this.colors[this.toIndex(color)];
  }

  protected abstract toIndex(color: Color): number;

  /**
   * Allows indexing into a palette.
   */
  public color(index: number): Color {
    return this.colors[index] ?? noColor;
  }

  /**
   * Gets the nearest color using Euclidean distance.
   *
   * @param color The color that is compared to find the nearest matching color.
   *
   * @returns The nearest color.
   */
  public nearest(color: Color): Color {
    const withDistances = this.colors.map((c) => ({ color: c, distance: colorDistance(c, color) }));
    const { color: nearestColor } = withDistances
      .reduce((nearest, check) => (
        check.distance < nearest.distance ? check : nearest
      ), { color: noColor, distance: Infinity });
    return nearestColor;
  }

  /**
   * Executes the callback on each color.
   *
   * @param cb The callback.
   */
  public forEach(cb: ColorCb) {
    return this.colors.forEach(cb);
  }
}
