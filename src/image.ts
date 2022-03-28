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
    const signature = new Uint8Array(bytes, 0, 7);
    if (!Image.validateSignature(signature)) {
      throw new DecodeError('Invalid signature', signature);
    }
    const modeByteReader = new Uint8Array(bytes, 7, 1);
    const mode: number = modeByteReader[0];
    this.pixelMode = flags.getPixelModeFlag(mode);
    this.paletteIncluded = flags.getPaletteIncludedFlag(mode);
    this.colorChannels = flags.getColorChannelFlag(mode);
    this.colorAccuracy = flags.getColorAccuracyFlag(mode);
    const dimensions = Image.decodeDimensions(new Uint8Array(bytes, 8, 3));
    this.width = dimensions.x;
    this.height = dimensions.y;
    if (this.paletteIncluded === flags.PaletteIncluded.Yes) {
      this.palette = Image.decodePalette(
        new BitReader(new Uint8Array(bytes, 11)),
        this.pixelMode,
        this.colorChannels,
        this.colorAccuracy,
      );
    } else {
      this.palette = Image.defaultPalette(this.pixelMode);
    }
  }

  public static validateSignature(signature: ArrayBuffer | Uint8Array | string): boolean {
    let s: string;

    if (signature instanceof ArrayBuffer) {
      const bytes = new Uint8Array(signature);
      s = String.fromCharCode(...bytes);
    } else if (signature instanceof Uint8Array) {
      s = String.fromCharCode(...signature);
    } else {
      s = signature;
    }

    return s === Image.signature;
  }

  private static decodeDimensions(bytes: Uint8Array): Dimensions {
    const reader = new BitReader(bytes);
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
