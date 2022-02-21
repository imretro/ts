import { Image } from '../src/index';

describe('utilities', () => {
  test('validateSignature', () => {
    const buff = new ArrayBuffer(7);
    const view = new Uint8Array(buff);
    const signature = 'IMRETRO';
    for (let i = 0; i < signature.length; ++i) {
      view[i] = signature.charCodeAt(i);
    }
    expect(Image.validateSignature(view)).toBe(true);
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
