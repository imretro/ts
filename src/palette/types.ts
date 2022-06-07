import type { Color } from '@imretro/color';

/**
 * The type that is used for callbacks executed on a palette.
 */
export type ColorCb<ReturnType = void> =
  (color: Color, index: number, colors: Color[]) => ReturnType;
