export enum PixelMode {
  OneBit = 0b00 << 6,
  TwoBit = 0b01 << 6,
  EightBit = 0b10 << 6,
}

export const getPixelModeFlag = (mode: number): PixelMode => mode & (0b11 << 6);

export enum PaletteIncluded {
  No = 0 << 5,
  Yes = 1 << 5,
}

export const getPaletteIncludedFlag = (mode: number): PaletteIncluded => mode & (1 << 5);

export enum ColorChannels {
  Grayscale = 0b00 << 1,
  RGB = 0b01 << 1,
  RGBA = 0b10 << 1,
}

export const getColorChannelFlag = (mode: number): ColorChannels => mode & (0b11 << 1);

export enum ColorAccuracy {
  TwoBit = 0,
  EightBit = 1,
}

export const getColorAccuracyFlag = (mode: number): ColorAccuracy => mode & 1;
