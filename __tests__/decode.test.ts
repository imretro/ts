import { Grayscale } from '@imretro/color';
import { Image } from '../src/index';
import {
  Palette,
  OneBit as OneBitPalette,
} from '../src/palette';
import * as palette from '../src/palette';
import {
  PixelMode,
  PaletteIncluded,
  ColorChannels,
  ColorAccuracy,
} from '../src/flags';

describe('static methods', () => {
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

  describe('defaultPalette', () => {
    test.each([
      ['OneBit', palette.default1Bit],
    ])('PixelMode.%s', (pixelModeFlag, want) => {
      const pixelMode = PixelMode[pixelModeFlag as keyof typeof PixelMode];
      expect(Image.defaultPalette(pixelMode)).toEqual(want);
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
    const buff = new ArrayBuffer(1024);
    addSignature(buff);
    setMode(buff, PixelMode.EightBit
      | PaletteIncluded.Yes
      | ColorChannels.RGB
      | ColorAccuracy.EightBit
    );

    const m = Image.decode(buff);

    expect(m.pixelMode).toEqual(PixelMode.EightBit);
    expect(m.paletteIncluded).toEqual(PaletteIncluded.Yes);
    expect(m.colorChannels).toEqual(ColorChannels.RGB);
    expect(m.colorAccuracy).toEqual(ColorAccuracy.EightBit);
  });

  test('dimensions', () => {
    const buff = new ArrayBuffer(20);
    addSignature(buff);
    const view = new Uint8Array(buff, 8, 3);
    view[0] = 0x01;
    view[1] = 0x20;
    view[2] = 0x24;

    const m = Image.decode(buff);
    expect(m.width).toBe(0x012);
    expect(m.height).toBe(0x024);
  });

  describe('encoded pixels', () => {
    test.each([
      [
        'OneBit',
        'Grayscale',
        'TwoBit',
        [0b1100_0000],
        new OneBitPalette(new Grayscale(0xFF), new Grayscale(0)),
      ],
    ])('[%#] PixelMode.%s ColorChannels.%s ColorAccuracy.%s', (
      pixelMode: string,
      channels: string,
      accuracy: string,
      paletteBytes: number[],
      want: Palette,
    ) => {
      const buff = new ArrayBuffer(1024);
      addSignature(buff);
      setMode(buff, PixelMode[pixelMode as keyof typeof PixelMode]
        | PaletteIncluded.Yes
        | ColorChannels[channels as keyof typeof ColorChannels]
        | ColorAccuracy[accuracy as keyof typeof ColorAccuracy]);
      setPalette(buff, paletteBytes);
      const m = Image.decode(buff);
      expect(m.palette).toEqual(want);
    });
  });
});

function addSignature(buff: ArrayBuffer, signature = 'IMRETRO'): void {
  const view = new Uint8Array(buff);
  for (let i = 0; i < signature.length; ++i) {
    view[i] = signature.charCodeAt(i);
  }
}

function setMode(buff: ArrayBuffer, mode: number): void {
  const view = new Uint8Array(buff, 7, 1);
  view[0] = mode;
}

// TODO Throw if palette included flag is not set
function setPalette(buff: ArrayBuffer, bytes: number[]): void {
  const view = new Uint8Array(buff, 11);
  bytes.forEach((b, index) => {
    view[index] = b;
  });
}
