import { DecodeError } from './errors';

export default class Image {
  public static readonly signature = 'IMRETRO';

  private constructor(bytes: ArrayBuffer) {
    const signature = new Uint8Array(bytes, 0, 7);
    if (!Image.validateSignature(signature)) {
      throw new DecodeError('Invalid signature', signature);
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

  public static decode(bytes: ArrayBuffer): Image {
    return new Image(bytes);
  }
}
