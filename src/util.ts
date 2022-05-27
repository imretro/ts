import { PixelMode, ColorChannels } from './flags';

export type ColorCount = 2 | 4 | 256;
export type ChannelCount = 1 | 3 | 4;

/**
 * @ignore
 */
export const pixelModeToColors = (mode: PixelMode & number): ColorCount => {
  switch (mode) {
    case PixelMode.OneBit:
      return 2;
    case PixelMode.TwoBit:
      return 4;
    case PixelMode.EightBit:
      return 256;
    /* c8 ignore start */
    default: {
      const unused: never = mode;
      return unused;
    }
    /* c8 ignore end */
  }
};

/**
 * @ignore
 */
export const colorsToPixelMode = (colors: ColorCount & number): PixelMode => {
  switch (colors) {
    case 2:
      return PixelMode.OneBit;
    case 4:
      return PixelMode.TwoBit;
    case 256:
      return PixelMode.EightBit;
    /* c8 ignore start */
    default: {
      const unused: never = colors;
      return unused;
    }
    /* c8 ignore end */
  }
};

/**
 * @ignore
 */
export const channelToCount = (channels: ColorChannels & number): ChannelCount => {
  switch (channels) {
    case ColorChannels.Grayscale:
      return 1;
    case ColorChannels.RGB:
      return 3;
    case ColorChannels.RGBA:
      return 4;
    /* c8 ignore start */
    default: {
      const unused: never = channels;
      return unused;
    }
    /* c8 ignore end */
  }
};
