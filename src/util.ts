import { PixelMode, ColorChannels } from './flags';

export type ColorCount = 2 | 4 | 256;
export type ChannelCount = 1 | 3 | 4;

/**
 * @private
 */
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

/**
 * @private
 */
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

/**
 * @private
 */
export const channelToCount = (channels: ColorChannels): ChannelCount => {
  switch (channels) {
    case ColorChannels.Grayscale:
      return 1;
    case ColorChannels.RGB:
      return 3;
    case ColorChannels.RGBA:
      return 4;
    default:
      return undefined as never;
  }
};

/**
 * @private
 */
export const unreachable = (): never => {
  throw new Error('Unreachable');
};

/**
 * @private
 */
export const unimplemented = (): never => {
  throw new Error('Not implemented');
};
