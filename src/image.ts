import type { Bit } from '@imretro/bitio';
import type { Color } from '@imretro/color';
import { Grayscale, RGB, RGBA } from '@imretro/color';
import { Reader as BitReader } from '@imretro/bitio';
import { unreachable } from 'logic-branch-helpers';
import type { Palette } from './palette';
import * as palettes from './palette';
import { DecodeError, EncodeError } from './errors';
import * as flags from './flags';
import { pixelModeToColors, channelToCount } from './util';

type Dimensions = { x: number, y: number };
type GrayTuple = [number];
type RGBTuple = [number, number, number];
type RGBATuple = [number, number, number, number];

export type Mode = number | [
  flags.PixelMode,
  flags.PaletteIncluded,
  flags.ColorChannels,
  flags.ColorAccuracy,
];

export default class Image {
  public static readonly signature = 'IMRETRO';

  public readonly pixelMode: flags.PixelMode;

  public readonly paletteIncluded: flags.PaletteIncluded;

  public readonly colorChannels: flags.ColorChannels;

  public readonly colorAccuracy: flags.ColorAccuracy;

  public constructor(
    mode: Mode,
    public readonly width: number,
    public readonly height: number,
    public readonly palette: Palette,
    private readonly pixels: number[],
  ) {
    if (typeof mode === 'number') {
      this.pixelMode = flags.getPixelModeFlag(mode);
      this.paletteIncluded = flags.getPaletteIncludedFlag(mode);
      this.colorChannels = flags.getColorChannelFlag(mode);
      this.colorAccuracy = flags.getColorAccuracyFlag(mode);
    } else {
      [this.pixelMode, this.paletteIncluded, this.colorChannels, this.colorAccuracy] = mode;
    }
  }

  public colorAt(x: number, y: number): Color {
    const index = (y * this.width) + x;
    return this.palette.color(this.pixels[index]);
  }

  /**
   * @internal
   * @ignore
   */
  private static validateSignature(signature: BitReader): boolean {
    const charCodes = signature.readBytes(7).filter((b: number | null): b is number => b != null);
    const s = String.fromCharCode(...charCodes);

    return s === Image.signature;
  }

  /**
   * @internal
   * @ignore
   */
  private static decodeDimensions(reader: BitReader): Dimensions {
    const x = reader.readBits(12);
    const y = reader.readBits(12);
    return { x, y };
  }

  /**
   * @internal
   * @ignore
   */
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
        return new palettes.OneBit(colors as [Color, Color]);
      case flags.PixelMode.TwoBit:
        return new palettes.TwoBit(colors as [Color, Color, Color, Color]);
      case flags.PixelMode.EightBit:
        return new palettes.EightBit(colors);
      /* c8 ignore start */
      default:
        return unreachable(`Pixel mode ${pixelMode}`);
      /* c8 ignore end */
    }
  }

  public static defaultPalette(pixelMode: flags.PixelMode): Palette {
    switch (pixelMode) {
      case flags.PixelMode.OneBit:
        return palettes.default1Bit;
      case flags.PixelMode.TwoBit:
        return palettes.default2Bit;
      case flags.PixelMode.EightBit:
        return palettes.default8Bit;
      /* c8 ignore start */
      default:
        return unreachable(`Pixel mode ${pixelMode}`);
      /* c8 ignore end */
    }
  }

  /**
   * @internal
   * @ignore
   */
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
    const reader = new BitReader(new Uint8Array(bytes));
    if (!Image.validateSignature(reader)) {
      throw new DecodeError('Invalid signature', new Uint8Array(bytes, 0, 7));
    }
    const mode = reader.readByte();
    if (mode == null) {
      throw new DecodeError('Missing mode byte');
    }
    const pixelMode = flags.getPixelModeFlag(mode);
    const paletteIncluded = flags.getPaletteIncludedFlag(mode);
    const colorChannels = flags.getColorChannelFlag(mode);
    const colorAccuracy = flags.getColorAccuracyFlag(mode);
    const dimensions = Image.decodeDimensions(reader);
    const width = dimensions.x;
    const height = dimensions.y;
    let palette;
    if (paletteIncluded === flags.PaletteIncluded.Yes) {
      palette = Image.decodePalette(
        reader,
        pixelMode,
        colorChannels,
        colorAccuracy,
      );
    } else {
      palette = Image.defaultPalette(pixelMode);
    }
    const pixels = Image.decodePixels(reader, pixelMode, [width, height]);
    return new Image(mode, width, height, palette, pixels);
  }

  /**
   * Get the number of bytes that would be needed to encode this image.
   */
  public encodedByteCount(): number {
    const bytesInSignature = 7;
    const modeByte = 1;
    const dimensionsBytes = 3;

    let bitsPerPixel: number;
    switch (this.pixelMode) {
      case flags.PixelMode.OneBit:
        bitsPerPixel = 1;
        break;
      case flags.PixelMode.TwoBit:
        bitsPerPixel = 2;
        break;
      case flags.PixelMode.EightBit:
        bitsPerPixel = 8;
        break;
      default:
        return unreachable();
    }

    let bitsPerChannel: number;
    switch (this.colorAccuracy) {
      case flags.ColorAccuracy.TwoBit:
        bitsPerChannel = 2;
        break;
      case flags.ColorAccuracy.EightBit:
        bitsPerChannel = 8;
        break;
      default:
        return unreachable();
    }
    const bitsForPalette = this.paletteIncluded === flags.PaletteIncluded.Yes
      ? pixelModeToColors(this.pixelMode) * channelToCount(this.colorChannels) * bitsPerChannel
      : 0;
    const bytesForPalette = Math.ceil(bitsForPalette / 8);

    const bytesForPixels = Math.ceil((bitsPerPixel * this.pixels.length) / 8);

    return bytesInSignature + modeByte + dimensionsBytes + bytesForPalette + bytesForPixels;
  }

  /**
   * Encodes the image to a buffer.
   *
   * If no buffer is provided, one will be created.
   *
   * @param buffer The ArrayBuffer to encode to.
   *
   * @returns The buffer with the encoded image.
   */
  public encode(buffer?: ArrayBuffer): ArrayBuffer {
    const byteCount = this.encodedByteCount();
    const view = buffer ? new Uint8Array(buffer) : new Uint8Array(byteCount);
    if (view.length < byteCount) {
      throw new EncodeError(`Expected at least ${byteCount} bytes, buffer has ${view.length}`);
    }
    return view.buffer;
  }
}
