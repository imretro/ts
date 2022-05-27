import { unreachable } from 'logic-branch-helpers';
import {
  PixelMode,
  PaletteIncluded,
  ColorChannels,
  ColorAccuracy,
} from './flags';

export type ColorCount = 2 | 4 | 256;
export type ChannelCount = 1 | 3 | 4;

/**
 * @ignore
 */
export const pixelModeToColors = (mode: PixelMode): ColorCount => {
  switch (mode) {
    case PixelMode.OneBit:
      return 2;
    case PixelMode.TwoBit:
      return 4;
    case PixelMode.EightBit:
      return 256;
    /* c8 ignore start */
    default:
      return unreachable();
    /* c8 ignore end */
  }
};

/**
 * @ignore
 */
export const colorsToPixelMode = (colors: ColorCount): PixelMode => {
  switch (colors) {
    case 2:
      return PixelMode.OneBit;
    case 4:
      return PixelMode.TwoBit;
    case 256:
      return PixelMode.EightBit;
    /* c8 ignore start */
    default:
      return unreachable();
    /* c8 ignore end */
  }
};

/**
 * @ignore
 */
export const channelToCount = (channels: ColorChannels): ChannelCount => {
  switch (channels) {
    case ColorChannels.Grayscale:
      return 1;
    case ColorChannels.RGB:
      return 3;
    case ColorChannels.RGBA:
      return 4;
    /* c8 ignore start */
    default:
      return unreachable();
    /* c8 ignore end */
  }
};

/**
 * @ignore
 *
 * Gets the number of bytes that should be in an image.
 */
export const byteCount = (
  pixelMode: PixelMode,
  palette: PaletteIncluded,
  channels: ColorChannels,
  accuracy: ColorAccuracy,
  pixelCount: number,
): number => {
  const bytesInSignature = 7;
  const modeByte = 1;
  const dimensionsBytes = 3;

  let bitsPerPixel: number;
  switch (pixelMode) {
    case PixelMode.OneBit:
      bitsPerPixel = 1;
      break;
    case PixelMode.TwoBit:
      bitsPerPixel = 2;
      break;
    case PixelMode.EightBit:
      bitsPerPixel = 8;
      break;
    default:
      return unreachable();
  }

  let bitsPerChannel: number;
  switch (accuracy) {
    case ColorAccuracy.TwoBit:
      bitsPerChannel = 2;
      break;
    case ColorAccuracy.EightBit:
      bitsPerChannel = 8;
      break;
    default:
      return unreachable();
  }
  const bitsForPalette = palette === PaletteIncluded.Yes
    ? pixelModeToColors(pixelMode) * channelToCount(channels) * bitsPerChannel
    : 0;
  const bytesForPalette = Math.ceil(bitsForPalette / 8);

  const bytesForPixels = Math.ceil((bitsPerPixel * pixelCount) / 8);

  return bytesInSignature + modeByte + dimensionsBytes + bytesForPalette + bytesForPixels;
};
