import { Image } from '../src/index';

describe('utilities', () => {
  describe('validateSignature', () => {
    const buff = new ArrayBuffer(7);
    const view = new Uint8Array(buff);
    const signature = 'IMRETRO';
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
    const view = new Uint8Array(buff);
    const signature = 'IMBAD';
    for (let i = 0; i < signature.length; ++i) {
      view[i] = signature.charCodeAt(i);
    }

    expect(() => Image.decode(buff)).toThrow();
  });
});
