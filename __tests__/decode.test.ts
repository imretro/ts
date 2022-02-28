import { Image } from '../src/index';
import {
  PixelMode,
  PaletteIncluded,
  ColorChannels,
  ColorAccuracy,
} from '../src/flags';

describe('utilities', () => {
  describe('validateSignature', () => {
    const buff = new ArrayBuffer(7);
    const view = new Uint8Array(buff);
    const signature = 'IMRETRO';
    addSignature(buff);
    for (let i = 0; i < signature.length; ++i) {
      view[i] = signature.charCodeAt(i);
    }

    test('ArrayBuffer', () => {
      expect(Image.validateSignature(buff)).toBe(true);
    });
    test('Uint8Array', () => {
      expect(Image.validateSignature(view)).toBe(true);
    });
    test('string', () => {
      expect(Image.validateSignature(signature)).toBe(true);
    });
  });
});

describe('decode', () => {
  test('bad signature', () => {
    const buff = new ArrayBuffer(20);
    addSignature(buff, 'IMBAD');

    expect(() => Image.decode(buff)).toThrow();
  });

  test('read mode byte', () => {
    const buff = new ArrayBuffer(8);
    addSignature(buff);
    const modeByteView = new Uint8Array(buff, 7, 1);
    modeByteView[0] = PixelMode.EightBit
      | PaletteIncluded.Yes
      | ColorChannels.RGB
      | ColorAccuracy.EightBit;

    const m = Image.decode(buff);

    expect(m.pixelMode).toEqual(PixelMode.EightBit);
    expect(m.paletteIncluded).toEqual(PaletteIncluded.Yes);
    expect(m.colorChannels).toEqual(ColorChannels.RGB);
    expect(m.colorAccuracy).toEqual(ColorAccuracy.EightBit);
  });
});

function addSignature(buff: ArrayBuffer, signature: string = 'IMRETRO'): void {
  const view = new Uint8Array(buff);
  for (let i = 0; i < signature.length; ++i) {
    view[i] = signature.charCodeAt(i);
  }
};
