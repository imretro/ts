import { DecodeError } from './errors';

export default class Image {
  public static readonly signature = 'IMRETRO';

  private constructor(bytes: ArrayBuffer) {
    const signature = new Uint8Array(bytes, 0, 7);
    if (!Image.validateSignature(signature)) {
      throw new DecodeError('Invalid signature', signature);
    }
  }

  public static validateSignature(signature: Uint8Array): boolean {
    return String.fromCharCode(...signature) === Image.signature;
  }

  public static decode(bytes: ArrayBuffer): Image {
    return new Image(bytes);
  }
}
