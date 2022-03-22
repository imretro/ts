import { PixelMode } from './flags';

export type ColorCount = 2 | 4 | 256;

export const pixelModeToColors = (mode: PixelMode): ColorCount => {
  switch (mode) {
    case PixelMode.OneBit:
      return 2;
    case PixelMode.TwoBit:
      return 4;
    case PixelMode.EightBit:
      return 256;
    default:
      return undefined as never;
  }
};

export const colorsToPixelMode = (colors: ColorCount): PixelMode => {
  switch (colors) {
    case 2:
      return PixelMode.OneBit;
    case 4:
      return PixelMode.TwoBit;
    case 256:
      return PixelMode.EightBit;
    default:
      return undefined as never;
  }
};
