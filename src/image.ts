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

  private constructor(bytes: ArrayBuffer) {
    const reader = new BitReader(new Uint8Array(bytes));
    if (!Image.validateSignature(reader)) {
      throw new DecodeError('Invalid signature', new Uint8Array(bytes, 0, 7));
    }
    const mode = reader.readBits(8);
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
  }

  private static validateSignature(signature: BitReader): boolean {
    const charCodes: number[] = new Array(7);
    for (let i = 0; i < 7; i += 1) {
      charCodes[i] = signature.readBits(8);
    }
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
      default:
        return unreachable();
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
          default:
            return unreachable();
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
        default:
          return unreachable();
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
      default:
        return unreachable(`Pixel mode ${pixelMode}`);
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
      default:
        return unreachable(`Pixel mode ${pixelMode}`);
    }
  }

  public static decode(bytes: ArrayBuffer): Image {
    return new Image(bytes);
  }
}
