import { DecodeError } from './errors';
import * as flags from './flags';

export default class Image {
  public static readonly signature = 'IMRETRO';
  public readonly pixelMode: flags.PixelMode;
  public readonly paletteIncluded: flags.PaletteIncluded;
  public readonly colorChannels: flags.ColorChannels;
  public readonly colorAccuracy: flags.ColorAccuracy;

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

  public static decode(bytes: ArrayBuffer): Image {
    return new Image(bytes);
  }
}
