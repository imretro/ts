import type { Bit } from '@imretro/bitio';
import type { Color } from '@imretro/color';
import { Grayscale, RGB, RGBA } from '@imretro/color';
import { Reader as BitReader } from '@imretro/bitio';
import { unreachable } from 'logic-branch-helpers';
import type { Palette } from './palette';
import * as palette from './palette';
import { DecodeError } from './errors';
import * as flags from './flags';
import {
  pixelModeToColors,
  channelToCount,
} from './util';

type Dimensions = { x: number, y: number };
type GrayTuple = [number];
type RGBTuple = [number, number, number];
type RGBATuple = [number, number, number, number];

export default class Image {
  public static readonly signature = 'IMRETRO';

  public readonly pixelMode: flags.PixelMode;

  public readonly paletteIncluded: flags.PaletteIncluded;

  public readonly colorChannels: flags.ColorChannels;

  public readonly colorAccuracy: flags.ColorAccuracy;

  public readonly width: number;

  public readonly height: number;

  public readonly palette: Palette;

  // NOTE Numbers correspond to indices into the palette.
  private readonly pixels: number[];

  private constructor(bytes: ArrayBuffer) {
    const reader = new BitReader(new Uint8Array(bytes));
    if (!Image.validateSignature(reader)) {
      throw new DecodeError('Invalid signature', new Uint8Array(bytes, 0, 7));
    }
    const mode = reader.readByte();
    if (mode == null) {
      throw new DecodeError('Missing mode byte');
    }
    this.pixelMode = flags.getPixelModeFlag(mode);
    this.paletteIncluded = flags.getPaletteIncludedFlag(mode);
    this.colorChannels = flags.getColorChannelFlag(mode);
    this.colorAccuracy = flags.getColorAccuracyFlag(mode);
    const dimensions = Image.decodeDimensions(reader);
    this.width = dimensions.x;
    this.height = dimensions.y;
    if (this.paletteIncluded === flags.PaletteIncluded.Yes) {
      this.palette = Image.decodePalette(
        reader,
        this.pixelMode,
        this.colorChannels,
        this.colorAccuracy,
      );
    } else {
      this.palette = Image.defaultPalette(this.pixelMode);
    }
    this.pixels = Image.decodePixels(reader, this.pixelMode, [this.width, this.height]);
  }

  public colorAt(x: number, y: number): Color {
    const index = (y * this.width) + x;
    return this.palette.color(this.pixels[index]);
  }

  private static validateSignature(signature: BitReader): boolean {
    const charCodes = signature.readBytes(7).filter((b: number | null): b is number => b != null);
    const s = String.fromCharCode(...charCodes);

    return s === Image.signature;
  }

  private static decodeDimensions(reader: BitReader): Dimensions {
    const x = reader.readBits(12);
    const y = reader.readBits(12);
    return { x, y };
  }

  private static decodePalette(
    reader: BitReader,
    pixelMode: flags.PixelMode,
    channels: flags.ColorChannels,
    accuracy: flags.ColorAccuracy,
  ): Palette {
    let bitsPerChannel: Readonly<number>;
    const colors: Color[] = [];
    const colorCount = pixelModeToColors(pixelMode);
    const channelCount = channelToCount(channels);

    switch (accuracy) {
      case flags.ColorAccuracy.TwoBit:
        bitsPerChannel = 2;
        break;
      case flags.ColorAccuracy.EightBit:
        bitsPerChannel = 8;
        break;
      /* c8 ignore start */
      default:
        return unreachable();
      /* c8 ignore end */
    }

    for (let i = 0; i < colorCount; i += 1) {
      const colorChannels: number[] = [];
      for (let j = 0; j < channelCount; j += 1) {
        let channel = reader.readBits(bitsPerChannel);
        switch (bitsPerChannel) {
          case 2:
            channel |= channel << 2;
            channel |= channel << 4;
            break;
          case 8:
            break;
          /* c8 ignore start */
          default:
            return unreachable();
          /* c8 ignore end */
        }
        colorChannels.push(channel);
      }

      switch (channels) {
        case flags.ColorChannels.Grayscale:
          colors.push(new Grayscale(...(colorChannels as GrayTuple)));
          break;
        case flags.ColorChannels.RGB:
          colors.push(new RGB(...(colorChannels as RGBTuple)));
          break;
        case flags.ColorChannels.RGBA:
          colors.push(new RGBA(...(colorChannels as RGBATuple)));
          break;
        /* c8 ignore start */
        default:
          return unreachable();
        /* c8 ignore end */
      }
    }

    // NOTE Length of color is known by `pixelMode` because it determines
    // `colorCount`, which sets how many times `colors` is pushed.
    switch (pixelMode) {
      case flags.PixelMode.OneBit:
        return new palette.OneBit(colors as [Color, Color]);
      case flags.PixelMode.TwoBit:
        return new palette.TwoBit(colors as [Color, Color, Color, Color]);
      case flags.PixelMode.EightBit:
        return new palette.EightBit(colors);
      /* c8 ignore start */
      default:
        return unreachable(`Pixel mode ${pixelMode}`);
      /* c8 ignore end */
    }
  }

  public static defaultPalette(pixelMode: flags.PixelMode): Palette {
    switch (pixelMode) {
      case flags.PixelMode.OneBit:
        return palette.default1Bit;
      case flags.PixelMode.TwoBit:
        return palette.default2Bit;
      case flags.PixelMode.EightBit:
        return palette.default8Bit;
      /* c8 ignore start */
      default:
        return unreachable(`Pixel mode ${pixelMode}`);
      /* c8 ignore end */
    }
  }

  private static decodePixels(
    reader: BitReader,
    pixelMode: flags.PixelMode,
    dimensions: [width: number, height: number],
  ): number[] {
    let bitsPerPixel: number;
    switch (pixelMode) {
      case flags.PixelMode.OneBit:
        bitsPerPixel = 1;
        break;
      case flags.PixelMode.TwoBit:
        bitsPerPixel = 2;
        break;
      case flags.PixelMode.EightBit:
        bitsPerPixel = 8;
        break;
      /* c8 ignore start */
      default:
        return unreachable();
      /* c8 ignore end */
    }

    const pixels: number[] = new Array(dimensions[0] * dimensions[1]);

    for (let i = 0; i < pixels.length; i += 1) {
      const bits = reader.readBitsSafe(bitsPerPixel);
      const noNulls: Bit[] = bits.filter((b: Bit | null): b is Bit => b != null);
      if (noNulls.length !== bits.length) {
        throw new DecodeError('Not enough bits to parse for pixels');
      }
      pixels[i] = BitReader.collectBits(noNulls);
    }

    return pixels;
  }

  public static decode(bytes: ArrayBuffer): Image {
    return new Image(bytes);
  }
}
