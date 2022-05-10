import * as color from '@imretro/color';
import { Image } from '../src/index';
import {
  Palette,
  OneBit as OneBitPalette,
  TwoBit as TwoBitPalette,
  EightBit as EightBitPalette,
} from '../src/palette';
import * as palette from '../src/palette';
import {
  PixelMode,
  PaletteIncluded,
  ColorChannels,
  ColorAccuracy,
} from '../src/flags';
import { DecodeError } from '../src/errors';

describe('static methods', () => {
  describe('defaultPalette', () => {
    test.each([
      ['OneBit', palette.default1Bit],
      ['TwoBit', palette.default2Bit],
      ['EightBit', palette.default8Bit],
    ])('PixelMode.%s', (pixelModeFlag, want) => {
      const pixelMode = PixelMode[pixelModeFlag as keyof typeof PixelMode];
      expect(Image.defaultPalette(pixelMode)).toBe(want);
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
    const buff = new ArrayBuffer(8 + (0x12 * 0x24));
    addSignature(buff);
    const view = new Uint8Array(buff, 8, 3);
    view[0] = 0x01;
    view[1] = 0x20;
    view[2] = 0x24;

    const m = Image.decode(buff);
    expect(m.width).toBe(0x012);
    expect(m.height).toBe(0x024);
  });

  describe('palettes', () => {
    test.each([
      [
        'OneBit',
        'Grayscale',
        'TwoBit',
        [0b1100_0000],
        new OneBitPalette(new color.Grayscale(0xFF), new color.Grayscale(0)),
      ],
      [
        'OneBit',
        'RGB',
        'TwoBit',
        [0b110011_11, 0b1000_0000],
        new OneBitPalette(new color.RGB(0xFF, 0, 0xFF), new color.RGB(0xFF, 0xAA, 0)),
      ],
      [
        'OneBit',
        'RGBA',
        'TwoBit',
        [0b00011011, 0b11001110],
        new OneBitPalette(new color.RGBA(0, 0x55, 0xAA, 0xFF), new color.RGBA(0xFF, 0, 0xFF, 0xAA)),
      ],
      [
        'OneBit',
        'Grayscale',
        'EightBit',
        [0x55, 0xAA],
        new OneBitPalette(new color.Grayscale(0x55), new color.Grayscale(0xAA)),
      ],
      [
        'TwoBit',
        'RGB',
        'EightBit',
        [
          0xFF, 0, 0,
          0, 0xFF, 0,
          0, 0, 0xFF,
          0xFF, 0xFF, 0xFF,
        ],
        new TwoBitPalette(
          new color.RGB(0xFF, 0, 0),
          new color.RGB(0, 0xFF, 0),
          new color.RGB(0, 0, 0xFF),
          new color.RGB(0xFF, 0xFF, 0xFF),
        ),
      ],
      [
        'EightBit',
        'Grayscale',
        'EightBit',
        Array.from({ length: 0x100 }).map((_, index) => 0xFF - index),
        new EightBitPalette(
          Array.from({ length: 0x100 }).map((_, index) => new color.Grayscale(0xFF - index)),
        ),
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

  describe('pixels', () => {
    test.each([
      [
        2,
        2,
        PixelMode.OneBit,
        [0b0110_0000],
        [
          [0, 0, '#000000'] as const,
          [1, 0, '#FFFFFF'] as const,
          [0, 1, '#FFFFFF'] as const,
          [1, 1, '#000000'] as const,
        ],
      ],
    ])('%dx%d image with pixel mode %d and bytes %p', (
      width: number,
      height: number,
      pixelMode: PixelMode,
      bytes: number[],
      wantedColors: Readonly<[x: number, y: number, hex: string]>[],
    ) => {
      const imageBytes = new Uint8Array([
        ...'IMRETRO'.split('').map((c) => c.charCodeAt(0)),
        pixelMode,
        // Dimensions
        0x00, (width << 4) | 0x00, height,
        ...bytes,
      ]);
      const m = Image.decode(imageBytes.buffer);

      wantedColors.forEach(([x, y, hex]) => {
        expect(m.colorAt(x, y).hex.toLowerCase()).toBe(hex.toLowerCase());
      });
    });

    test.each([
      [PixelMode.OneBit, 12],
      [PixelMode.TwoBit, 13],
      [PixelMode.EightBit, 19],
    ])('3x3 image with pixel mode with pixel mode %d and %d bytes throws', (
      mode: PixelMode,
      byteCount: number,
    ) => {
      const buff = new ArrayBuffer(byteCount);
      addSignature(buff);
      const modeView = new Uint8Array(buff, 8, 1);
      modeView[0] = mode;

      expect(() => Image.decode(buff))
        .toThrow(new DecodeError('Not enough bits to parse for pixels'));
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
